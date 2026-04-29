import { Router, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const aiRouter = Router();

// We will initialize this only if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Mock Auth Middleware (to match transaction routes)
const mockAuth = async (req: any, res: Response, next: any) => {
  req.user = { id: 'dummy-user-id' }; 
  next();
};

aiRouter.use(mockAuth);

aiRouter.get('/insights', async (req: any, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend/.env' });
    }
    const userId = req.user.id;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const transactions = await transactionService.getTransactionsByMonth(userId, year, month);
    const summary = await transactionService.getDashboardSummary(userId, year, month);
    
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    const prompt = `
You are a financial advisor AI named FinAI. The user wants a quick summary of their spending this month to be displayed on their dashboard.
Data:
- Total Income: ${summary.totalIncome} THB
- Total Expense: ${summary.totalExpense} THB
- Net Balance: ${summary.netBalance} THB
Transactions: ${expenses.map(e => e.amount + ' THB on ' + (e.category?.name || 'Other')).join(', ')}

Please provide a short, punchy, 2-3 sentence analysis in Thai language. Mention how much they spent and what is their biggest expense category. Give one brief encouraging advice. Use Markdown bolding for emphasis.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    res.json({ insights: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

aiRouter.post('/chat', async (req: any, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend/.env' });
    }

    const { message, history } = req.body;
    const userId = req.user.id;
    
    // Fetch user's data for context
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const transactions = await transactionService.getTransactionsByMonth(userId, year, month);
    const summary = await transactionService.getDashboardSummary(userId, year, month);
    
    const systemPrompt = `
You are a highly intelligent and friendly Personal Finance Assistant named "FinAI".
The user is asking you for financial advice or analysis based on their current month's data.

[FINANCIAL DATA CONTEXT]
Current Month Summary:
- Total Income: ${summary.totalIncome} THB
- Total Expense: ${summary.totalExpense} THB
- Net Balance: ${summary.netBalance} THB

Recent Transactions (Current Month):
${transactions.map(t => `- [${t.date.toISOString().split('T')[0]}] ${t.type === 'INCOME' ? '+' : '-'}${t.amount} THB | Category: ${t.category?.name || 'Uncategorized'} | Desc: ${t.description}`).join('\n')}

[INSTRUCTIONS]
1. Answer the user's question accurately using ONLY the data provided above.
2. If they ask about spending habits, analyze the categories and give brief advice.
3. Be friendly, empathetic, and encouraging.
4. Reply in the same language as the user's prompt (mostly Thai).
5. Format your response clearly using markdown if necessary (bullet points, bold text).
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Build chat history
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'รับทราบครับ ผมคือ FinAI ผู้ช่วยด้านการเงินของคุณ พร้อมให้คำแนะนำจากข้อมูลที่คุณมีแล้วครับ' }] },
        ...formattedHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});
