import { prisma } from '../lib/prisma';

export const transactionService = {
  // Fetch all transactions (with their categories) for a specific month
  async getTransactionsByMonth(userId: string, year: number, month: number) {
    // month is 1-indexed (1 = Jan, 12 = Dec)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true, // Join category data
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  // Predefined Fixed Categories
  async getLockedCategories(userId: string) {
    const fixedCategories = [
      { name: 'Food & Beverage', type: 'EXPENSE' },
      { name: 'Transportation', type: 'EXPENSE' },
      { name: 'Shopping', type: 'EXPENSE' },
      { name: 'Utilities & Bills', type: 'EXPENSE' },
      { name: 'Entertainment', type: 'EXPENSE' },
      { name: 'Health & Fitness', type: 'EXPENSE' },
      { name: 'Other Expense', type: 'EXPENSE' },
      { name: 'Income/Salary', type: 'INCOME' },
      { name: 'Freelance & Business', type: 'INCOME' },
      { name: 'Investment', type: 'INCOME' },
      { name: 'Other Income', type: 'INCOME' },
    ];

    // Ensure all fixed categories exist for this user
    for (const cat of fixedCategories) {
      await prisma.category.upsert({
        where: { 
          // We don't have a unique constraint on (name, userId) in schema,
          // so we use findFirst and create if not found.
          // Wait, Prisma upsert requires a unique field. Since we don't have it, we use manual check.
          id: 'dummy-id-wont-match' 
        },
        update: {},
        create: { name: cat.name, type: cat.type, userId }
      }).catch(async () => {
        // Fallback to manual check
        const exists = await prisma.category.findFirst({ where: { name: cat.name, userId } });
        if (!exists) {
          await prisma.category.create({ data: { name: cat.name, type: cat.type, userId } });
        }
      });
    }

    return prisma.category.findMany({ where: { userId } });
  },

  // Auto-tag rules
  async autoTagCategory(description: string, type: string, userId: string) {
    // First, ensure categories are locked and initialized
    const categories = await this.getLockedCategories(userId);

    if (!description) return categories.find(c => c.name === (type === 'INCOME' ? 'Other Income' : 'Other Expense'))?.id || null;
    
    const lowerDesc = description.toLowerCase();
    
    const rules = [
      { keywords: ['coffee', 'กาแฟ', 'food', 'อาหาร', 'ข้าว', 'kfc', 'mcdonald', 'ขนม', 'เครื่องดื่ม', 'น้ำ'], name: 'Food & Beverage', type: 'EXPENSE' },
      { keywords: ['grab', 'bts', 'mrt', 'bus', 'เดินทาง', 'taxi', 'แท็กซี่', 'น้ำมัน', 'รถ'], name: 'Transportation', type: 'EXPENSE' },
      { keywords: ['shopping', 'ช้อปปิ้ง', 'เสื้อผ้า', 'shopee', 'lazada', 'ซื้อของ'], name: 'Shopping', type: 'EXPENSE' },
      { keywords: ['ไฟ', 'น้ำ', 'เน็ต', 'internet', 'โทรศัพท์', 'bill', 'บิล', 'ค่าเช่า'], name: 'Utilities & Bills', type: 'EXPENSE' },
      { keywords: ['หนัง', 'movie', 'netflix', 'spotify', 'เกม', 'game', 'เที่ยว'], name: 'Entertainment', type: 'EXPENSE' },
      { keywords: ['ยา', 'หมอ', 'โรงพยาบาล', 'ฟิตเนส', 'fitness', 'สุขภาพ'], name: 'Health & Fitness', type: 'EXPENSE' },
      
      { keywords: ['salary', 'เงินเดือน', 'bonus', 'โบนัส'], name: 'Income/Salary', type: 'INCOME' },
      { keywords: ['freelance', 'ฟรีแลนซ์', 'รับจ้าง', 'ขาย'], name: 'Freelance & Business', type: 'INCOME' },
      { keywords: ['ปันผล', 'หุ้น', 'ดอกเบี้ย', 'dividend'], name: 'Investment', type: 'INCOME' },
    ];

    for (const rule of rules) {
      if (rule.type !== type) continue;
      for (const keyword of rule.keywords) {
        if (lowerDesc.includes(keyword)) {
          return categories.find(c => c.name === rule.name)?.id || null;
        }
      }
    }
    
    // Fallback to Other
    const fallbackName = type === 'INCOME' ? 'Other Income' : 'Other Expense';
    return categories.find(c => c.name === fallbackName)?.id || null;
  },

  // Create a new transaction
  async createTransaction(data: {
    amount: number;
    type: string; // 'INCOME' | 'EXPENSE'
    date: Date;
    description?: string;
    userId: string;
    categoryId?: string;
  }) {
    let finalCategoryId = data.categoryId;

    if (!finalCategoryId && data.description) {
      const autoId = await this.autoTagCategory(data.description, data.type, data.userId);
      if (autoId) finalCategoryId = autoId;
    }

    return prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        date: data.date,
        description: data.description,
        userId: data.userId,
        categoryId: finalCategoryId
      },
      include: {
        category: true,
      },
    });
  },

  // Import transactions in bulk
  async importTransactions(userId: string, transactions: any[]) {
    let imported = 0;
    for (const tx of transactions) {
      if (!tx.amount || !tx.type) continue;
      
      let finalCategoryId = tx.categoryId;
      if (!finalCategoryId && tx.description) {
        finalCategoryId = await this.autoTagCategory(tx.description, tx.type, userId);
      }

      await prisma.transaction.create({
        data: {
          amount: parseFloat(tx.amount),
          type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
          date: tx.date ? new Date(tx.date) : new Date(),
          description: tx.description || '',
          userId,
          categoryId: finalCategoryId || undefined,
        }
      });
      imported++;
    }
    return { imported };
  },

  // Get a summary of total income and total expenses for a dashboard view
  async getDashboardSummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Group by 'type' and calculate the sum of 'amount'
    const aggregates = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    aggregates.forEach((group) => {
      if (group.type === 'INCOME') totalIncome += group._sum.amount || 0;
      if (group.type === 'EXPENSE') totalExpense += group._sum.amount || 0;
    });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  },
};
