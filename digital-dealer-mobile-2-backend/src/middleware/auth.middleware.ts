import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role_id: number;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role_id: number;
    };

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}; 