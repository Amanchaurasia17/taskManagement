import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired access token' });
      return;
    }
    req.user = user as { id: number; email: string };
    next();
  });
};
