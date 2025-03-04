// src/validators/roundValidators.ts

import { body, param } from 'express-validator';

export const createRoundValidator = [
  body('courseId')
    .isUUID()
    .withMessage('Valid course ID is required'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  
  body('playerNames')
    .optional()
    .isArray()
    .withMessage('Player names must be an array'),
  
  body('playerNames.*')
    .isString()
    .notEmpty()
    .withMessage('Player names must be non-empty strings'),
  
  body('participantIds')
    .optional()
    .isArray()
    .withMessage('Participant IDs must be an array'),
  
  body('participantIds.*')
    .isUUID()
    .withMessage('Participant IDs must be valid UUIDs')
];

export const updateScoreValidator = [
  param('roundId')
    .isUUID()
    .withMessage('Invalid round ID format'),
  
  param('playerId')
    .isUUID()
    .withMessage('Invalid player ID format'),
  
  param('holeId')
    .isUUID()
    .withMessage('Invalid hole ID format'),
  
  body('strokes')
    .isInt({ min: 0, max: 99 })
    .withMessage('Strokes must be between 0 and 99')
];

export const updateRoundStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid round ID format'),
  
  body('status')
    .isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELED'])
    .withMessage('Status must be one of: IN_PROGRESS, COMPLETED, CANCELED')
];