// src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { AppError } from './types';
import { errorHandler } from './utils/errorHandler';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import roundRoutes from './routes/rounds';
import statsRoutes from './routes/stats';
import userRoutes from './routes/users';
import config, { isProduction } from './config/environment';




// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
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
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);




// Handle unhandled routes (moved before error handler to prevent error)
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});



if (isProduction()) {
  // In production, don't send detailed error information
  app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);
    
    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        message: err.message || 'An error occurred' 
      });
    } else {
      // Don't expose internal server errors in production
      res.status(500).json({ message: 'An error occurred' });
    }
  });
} else {
  // In development, use the detailed error handler
  app.use(errorHandler);
}




// Properly close Prisma when the app terminates
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;