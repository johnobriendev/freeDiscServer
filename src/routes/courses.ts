// src/routes/courses.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { 
  createCourse, 
  getCourses, 
  getCourseById, 
  updateCourse,
  deleteCourse,
  updateHole,
  searchCourses
} from '../controllers/courseController';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { 
  createCourseValidator, 
  updateCourseValidator, 
  updateHoleValidator,
  searchCoursesValidator
} from '../validators/courseValidators';

const router = express.Router();

// Course search doesn't require authentication
router.get('/search', validate(searchCoursesValidator), asyncHandler(searchCourses));

// All other routes require authentication
router.use(authenticate);

// Course routes
router.post('/', validate(createCourseValidator), asyncHandler(createCourse));
router.get('/', asyncHandler(getCourses));
router.get('/:id', asyncHandler(getCourseById));
router.patch('/:id', validate(updateCourseValidator), asyncHandler(updateCourse));
router.delete('/:id', asyncHandler(deleteCourse));

// Hole routes
router.patch('/:courseId/holes/:holeNumber', validate(updateHoleValidator), asyncHandler(updateHole));

export default router;