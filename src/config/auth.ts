// src/config/auth.ts
import { Secret } from 'jsonwebtoken';


export const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';