// src/validators/courseValidators.ts

import { body, query, param } from 'express-validator';

export const createCourseValidator = [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Course name is required'),
  
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  
  body('holeCount')
    .optional()
    .isInt({ min: 1, max: 36 })
    .withMessage('Hole count must be between 1 and 36'),
  
  body('holeLengths')
    .optional()
    .isArray()
    .withMessage('Hole lengths must be an array')
];

export const updateCourseValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID format'),
  
  body('name')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Course name cannot be empty'),
  
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
];

export const updateHoleValidator = [
  param('courseId')
    .isUUID()
    .withMessage('Invalid course ID format'),
  
  param('holeNumber')
    .isInt({ min: 1, max: 36 })
    .withMessage('Hole number must be between 1 and 36'),
  
  body('par')
    .optional()
    .isInt({ min: 2, max: 8 })
    .withMessage('Par must be between 2 and 8'),
  
  body('lengthFeet')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Length must be a positive number')
];

export const searchCoursesValidator = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search term must be a string'),
  
  query('minHoles')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum holes must be a positive number'),
  
  query('maxHoles')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum holes must be a positive number'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'location', 'holeCount', 'createdAt'])
    .withMessage('Sort field must be one of: name, location, holeCount, createdAt'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];