// src/routes/users.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getUserProfile, 
  updateUserProfile, 
  updatePassword 
} from '../controllers/userController';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', asyncHandler(getUserProfile));
router.patch('/profile', asyncHandler(updateUserProfile));
router.patch('/password', asyncHandler(updatePassword));

export default router;