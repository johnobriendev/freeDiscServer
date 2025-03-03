// src/routes/rounds.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createRound,
  getRounds,
  getRoundById,
  updateRoundStatus,
  addPlayerToRound,
  updateScore
} from '../controllers/roundController';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Round routes
router.post('/', asyncHandler(createRound));
router.get('/', asyncHandler(getRounds));
router.get('/:id', asyncHandler(getRoundById));
router.patch('/:id/status', asyncHandler(updateRoundStatus));

// Player routes
router.post('/:roundId/players', asyncHandler(addPlayerToRound));

// Score routes
router.patch('/:roundId/players/:playerId/holes/:holeId/score', asyncHandler(updateScore));

export default router;