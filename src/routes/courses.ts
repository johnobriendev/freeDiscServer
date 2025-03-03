// src/routes/courses.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createCourse, 
  getCourses, 
  getCourseById, 
  updateCourse,
  deleteCourse,
  updateHole
} from '../controllers/courseController';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Course routes
router.post('/', asyncHandler(createCourse));
router.get('/', asyncHandler(getCourses));
router.get('/:id', asyncHandler(getCourseById));
router.patch('/:id', asyncHandler(updateCourse));
router.delete('/:id', asyncHandler(deleteCourse));

// Hole routes
router.patch('/:courseId/holes/:holeNumber', asyncHandler(updateHole));

export default router;