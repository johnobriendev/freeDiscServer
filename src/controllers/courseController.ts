// src/controllers/courseController.ts

import { Request, Response, NextFunction } from 'express';
import '../types';

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, location, description, holeCount = 18 } = req.body;
    
    // Get user ID from authenticated user
    const ownerId = req.user!.id;
    
    // Create course with holes
    const course = await req.prisma.course.create({
      data: {
        name,
        location,
        description,
        holeCount,
        ownerId,
        holes: {
          create: Array.from({ length: holeCount }, (_, i) => ({
            holeNumber: i + 1,
            par: 3, // Default par
            lengthFeet: req.body.holeLengths ? req.body.holeLengths[i] : null
          }))
        }
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc'
          }
        }
      }
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all courses
    const courses = await req.prisma.course.findMany({
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc'
          }
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const course = await req.prisma.course.findUnique({
      where: { id },
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc'
          }
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;
    const userId = req.user!.id;

    // Check if course exists
    const existingCourse = await req.prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is the owner
    if (existingCourse.ownerId !== userId) {
      res.status(403).json({ message: 'Not authorized to update this course' });
      return;
    }

    // Update course
    const course = await req.prisma.course.update({
      where: { id },
      data: {
        name,
        location,
        description
      },
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc'
          }
        }
      }
    });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if course exists
    const existingCourse = await req.prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is the owner
    if (existingCourse.ownerId !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this course' });
      return;
    }

    // Delete course (this will cascade delete holes too because of our schema)
    await req.prisma.course.delete({
      where: { id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateHole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, holeNumber } = req.params;
    const { par, lengthFeet } = req.body;
    const userId = req.user!.id;

    // Check if course exists and user is the owner
    const course = await req.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.ownerId !== userId) {
      res.status(403).json({ message: 'Not authorized to update this course' });
      return;
    }

    // Find the hole
    const hole = await req.prisma.hole.findFirst({
      where: {
        courseId,
        holeNumber: parseInt(holeNumber)
      }
    });

    if (!hole) {
      res.status(404).json({ message: 'Hole not found' });
      return;
    }

    // Update hole
    const updatedHole = await req.prisma.hole.update({
      where: { id: hole.id },
      data: {
        par: par ? parseInt(par) : hole.par,
        lengthFeet: lengthFeet ? parseInt(lengthFeet) : hole.lengthFeet
      }
    });

    res.json(updatedHole);
  } catch (error) {
    next(error);
  }
};


export const searchCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      search,           // Search term for name or location
      minHoles,         // Minimum number of holes (e.g., 9, 18)
      maxHoles,         // Maximum number of holes
      createdBy,        // Courses created by a specific user
      sortBy = 'name',  // Field to sort by (name, location, holeCount, createdAt)
      sortOrder = 'asc' // Sort direction (asc, desc)
    } = req.query;

    // Build the where clause for the query
    const where: any = {};
    
    // Add search condition if provided
    if (search) {
      const searchStr = String(search);
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { location: { contains: searchStr, mode: 'insensitive' } }
      ];
    }
    
    // Add hole count filter if provided
    if (minHoles) {
      where.holeCount = { 
        ...where.holeCount,
        gte: Number(minHoles) 
      };
    }
    
    if (maxHoles) {
      where.holeCount = { 
        ...where.holeCount,
        lte: Number(maxHoles) 
      };
    }
    
    // Add creator filter if provided
    if (createdBy) {
      where.ownerId = String(createdBy);
    }
    
    // Validate and set the sort field
    let orderBy: any = {};
    const validSortFields = ['name', 'location', 'holeCount', 'createdAt'];
    const sortField = validSortFields.includes(String(sortBy)) 
      ? String(sortBy) 
      : 'name';
    
    // Validate and set the sort direction
    const direction = String(sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc';
    orderBy[sortField] = direction;

    // Execute the search query
    const courses = await req.prisma.course.findMany({
      where,
      include: {
        holes: {
          orderBy: {
            holeNumber: 'asc'
          }
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        // Include count of rounds played on this course
        _count: {
          select: {
            rounds: true
          }
        }
      },
      orderBy
    });

    // Add additional metadata to courses
    const enhancedCourses = courses.map(course => {
      const { _count, ...courseData } = course;
      
      // Calculate average par for the course
      const totalPar = course.holes.reduce((sum, hole) => sum + hole.par, 0);
      const averagePar = parseFloat((totalPar / course.holes.length).toFixed(1));
      
      // Calculate total length if available
      let totalLength = 0;
      const holesWithLength = course.holes.filter(hole => hole.lengthFeet !== null);
      
      if (holesWithLength.length > 0) {
        totalLength = holesWithLength.reduce((sum, hole) => sum + (hole.lengthFeet || 0), 0);
      }
      
      return {
        ...courseData,
        rounds: _count.rounds,
        averagePar,
        totalLength
      };
    });

    res.json({
      count: enhancedCourses.length,
      courses: enhancedCourses
    });
  } catch (error) {
    next(error);
  }
};