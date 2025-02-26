// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';
import { JwtPayload, RequestWithPrisma } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

const authenticateMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Find user by id
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Set user on request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};

// Export the wrapped middleware
export const authenticate = asyncHandler(authenticateMiddleware);