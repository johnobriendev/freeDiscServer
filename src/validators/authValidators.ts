// src/validators/authValidators.ts

import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string'),
  
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isString()
    .withMessage('Password is required')
];