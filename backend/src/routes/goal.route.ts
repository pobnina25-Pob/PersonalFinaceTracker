import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

export const goalRouter = Router();

const mockAuth = async (req: any, res: Response, next: any) => {
  req.user = { id: 'dummy-user-id' }; 
  next();
};

goalRouter.use(mockAuth);

// GET /api/goals
goalRouter.get('/', async (req: any, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
goalRouter.post('/', async (req: any, res: Response) => {
  try {
    const { title, targetAmount, deadline } = req.body;
    const newGoal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        userId: req.user.id
      }
    });
    res.json(newGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id (Add funds or update target)
goalRouter.put('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, addAmount } = req.body;
    
    // Fetch current goal first to add funds
    const currentGoal = await prisma.goal.findUnique({ where: { id } });
    if (!currentGoal || currentGoal.userId !== req.user.id) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        title: title || currentGoal.title,
        targetAmount: targetAmount ? parseFloat(targetAmount) : currentGoal.targetAmount,
        currentAmount: addAmount ? currentGoal.currentAmount + parseFloat(addAmount) : currentGoal.currentAmount
      }
    });
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
goalRouter.delete('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});
