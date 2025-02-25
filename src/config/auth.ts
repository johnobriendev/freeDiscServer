// src/config/auth.ts

export const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';