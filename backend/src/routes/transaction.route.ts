import { Router, Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

export const transactionRouter = Router();

import { prisma } from '../lib/prisma';

// Mock Authentication Middleware
const mockAuth = async (req: any, res: Response, next: any) => {
  req.user = { id: 'dummy-user-id' }; 
  
  try {
    const existing = await prisma.user.findUnique({ where: { id: 'dummy-user-id' } });
    if (!existing) {
      await prisma.user.create({
        data: { id: 'dummy-user-id', email: 'test@example.com', name: 'Test User' }
      });
    }
    next();
  } catch (error: any) {
    console.error("Auth Error:", error.message || error);
    res.status(500).json({ error: 'Auth failed', detail: error.message });
  }
};

transactionRouter.use(mockAuth);

// GET /api/transactions/categories
transactionRouter.get('/categories', async (req: any, res: Response) => {
  try {
    const categories = await transactionService.getLockedCategories(req.user.id);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/transactions/summary
transactionRouter.get('/summary', async (req: any, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const userId = req.user.id;

    const summary = await transactionService.getDashboardSummary(userId, year, month);
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transaction summary' });
  }
});

// GET /api/transactions
transactionRouter.get('/', async (req: any, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const userId = req.user.id;

    const transactions = await transactionService.getTransactionsByMonth(userId, year, month);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions/import
transactionRouter.post('/import', async (req: any, res: Response) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    const result = await transactionService.importTransactions(req.user.id, transactions);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import transactions' });
  }
});

// POST /api/transactions
transactionRouter.post('/', async (req: any, res: Response) => {
  try {
    const { amount, type, date, description, categoryId } = req.body;
    const userId = req.user.id;

    const newTransaction = await transactionService.createTransaction({
      amount: parseFloat(amount),
      type,
      date: date ? new Date(date) : new Date(),
      description,
      userId,
      categoryId,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/reset (delete ALL transactions for this user)
transactionRouter.delete('/reset', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const deleted = await prisma.transaction.deleteMany({ where: { userId } });
    res.json({ deleted: deleted.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset transactions' });
  }
});

// DELETE /api/transactions/:id
transactionRouter.delete('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});
