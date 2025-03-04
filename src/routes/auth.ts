// src/routes/auth.ts

import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { registerValidator, loginValidator } from '../validators/authValidators';


const router = express.Router();

// Public routes
router.post('/register', validate(registerValidator), asyncHandler(register));
router.post('/login', validate(loginValidator), asyncHandler(login));

// Protected routes
router.get('/profile', authenticate, asyncHandler(getProfile));


export default router;