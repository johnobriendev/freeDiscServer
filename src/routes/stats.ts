// src/routes/stats.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { getPlayerStats, getRoundStats } from '../controllers/statsController';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Stats routes
router.get('/player', asyncHandler(getPlayerStats));
router.get('/rounds/:roundId', asyncHandler(getRoundStats));

export default router;