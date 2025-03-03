// src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { AppError } from './types';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import roundRoutes from './routes/rounds';

// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Make Prisma available to all routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).prisma = prisma;
  next();
});

// Basic route for testing
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Golf Scorekeeping API is running' });
});

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rounds', roundRoutes);


// Handle unhandled routes (moved before error handler to prevent error)
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Error handler
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({
      message: 'A record with this information already exists'
    });
    return;
  }
  
  if (err.code === 'P2025') {
    res.status(404).json({
      message: 'Record not found'
    });
    return; 
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server'
  });
});



// Properly close Prisma when the app terminates
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;