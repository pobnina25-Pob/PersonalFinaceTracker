import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

export const userRouter = Router();

// Mock Auth Middleware
const mockAuth = async (req: any, res: Response, next: any) => {
  req.user = { id: 'dummy-user-id' }; 
  next();
};

userRouter.use(mockAuth);

// GET /api/user
userRouter.get('/', async (req: any, res: Response) => {
  try {
    const user = await prisma.user.upsert({
      where: { id: req.user.id },
      update: {},
      create: {
        id: req.user.id,
        email: 'dummy@example.com',
        name: 'Dummy User',
        savingsGoal: 0
      },
      select: { id: true, name: true, email: true, savingsGoal: true }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// PUT /api/user/goal
userRouter.put('/goal', async (req: any, res: Response) => {
  try {
    const { savingsGoal } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { savingsGoal: parseFloat(savingsGoal) },
      select: { savingsGoal: true }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});
