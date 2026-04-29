import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { transactionRouter } from './routes/transaction.route';
import { aiRouter } from './routes/ai.route';
import { userRouter } from './routes/user.route';
import { goalRouter } from './routes/goal.route';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/transactions', transactionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);
app.use('/api/goals', goalRouter);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
