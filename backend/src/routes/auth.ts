import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const router = Router();

const generateTokens = (user: { id: number; email: string }) => {
  const accessToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', (req: Request, res: Response): void => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token required' });
    return;
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email });
    res.json(tokens);
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  // Client should delete tokens on their end
  // If we had a database table for refresh tokens, we would revoke it here.
  res.json({ message: 'Logged out successfully' });
});

export default router;
