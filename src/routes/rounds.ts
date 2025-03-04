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
import { validate } from '../middleware/validate';
import { 
  createRoundValidator, 
  updateScoreValidator,
  updateRoundStatusValidator
} from '../validators/roundValidators';


const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Round routes
router.post('/', validate(createRoundValidator), asyncHandler(createRound));
router.get('/', asyncHandler(getRounds));
router.get('/:id', asyncHandler(getRoundById));
router.patch('/:id/status', validate(updateRoundStatusValidator), asyncHandler(updateRoundStatus));

// Player routes
router.post('/:roundId/players', asyncHandler(addPlayerToRound));

// Score routes
router.patch('/:roundId/players/:playerId/holes/:holeId/score', validate(updateScoreValidator), asyncHandler(updateScore));


export default router;