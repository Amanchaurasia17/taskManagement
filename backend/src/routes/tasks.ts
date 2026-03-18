import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

// GET /tasks: pagination, filtering by status, search by title
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10', status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };

    if (status) {
      where.status = String(status);
    }
    
    if (search) {
      where.title = { contains: String(search) }; // SQLite doesn't have mode: 'insensitive' typically but `contains` works
    }

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.task.count({ where });

    res.json({
      tasks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = Number(req.params.id);

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /tasks
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = Number(req.params.id);
    const { title, description, status } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = Number(req.params.id);

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH /tasks/:id/toggle
router.patch('/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const taskId = Number(req.params.id);

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const newStatus = existingTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task status' });
  }
});

export default router;
