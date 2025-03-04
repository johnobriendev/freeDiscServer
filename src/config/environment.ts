// src/config/environment.ts

// Define environment types
type NodeEnv = 'development' | 'test' | 'production';

// Ensure environment variables are set
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in environment variables');
}

// Configuration object
const config = {
  env: (process.env.NODE_ENV as NodeEnv) || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/golfapp'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  
};

// Helper functions for environment checks
export const isDevelopment = (): boolean => config.env === 'development';
export const isTest = (): boolean => config.env === 'test';
export const isProduction = (): boolean => config.env === 'production';

export default config;