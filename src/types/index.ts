// src/types/index.ts

import { User, PrismaClient } from '@prisma/client';

// Extend Express Request to include our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: User;
      prisma: PrismaClient;
    }
  }
}

// Add type for extended request with prisma
export interface RequestWithPrisma extends Request {
  prisma: PrismaClient; 
}

// JWT payload interface
export interface JwtPayload {
  id: string;
  email: string;
}

// Registration request type
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Login request type
export interface LoginRequest {
  email: string;
  password: string;
}

// App error type
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}
