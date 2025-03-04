// src/config/auth.ts
import { Secret } from 'jsonwebtoken';
import config from './environment';



export const JWT_SECRET: Secret = config.auth.jwtSecret || 'your-jwt-secret';
export const JWT_EXPIRES_IN = config.auth.jwtExpiresIn || '7d';