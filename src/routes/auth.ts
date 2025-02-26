// src/routes/auth.ts

import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';


const router = express.Router();

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));


export default router;