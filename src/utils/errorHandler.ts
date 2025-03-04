// src/utils/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Handle specific Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({
          message: 'A record with this information already exists'
        });
        return;
        
      case 'P2025': // Record not found
        res.status(404).json({
          message: 'Resource not found'
        });
        return;
        
      case 'P2003': // Foreign key constraint violation
        res.status(400).json({
          message: 'Invalid reference to a related resource'
        });
        return;
        
      case 'P2018': // Required field is missing
        res.status(400).json({
          message: 'Required field is missing'
        });
        return;
    }
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token'
    });
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Token expired'
    });
    return;
  }
  
  // Handle custom errors with status codes
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server'
  });
};