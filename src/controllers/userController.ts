// src/controllers/userController.ts

import '../types';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    // Get user profile with additional statistics
    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // Count user's courses, rounds, and scores
        _count: {
          select: {
            ownedCourses: true,
            ownedRounds: true,
            participatingRounds: true,
            playerProfiles: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Format the response
    const { _count, ...userProfile } = user;
    
    res.json({
      ...userProfile,
      stats: {
        coursesCreated: _count.ownedCourses,
        roundsCreated: _count.ownedRounds,
        roundsParticipated: _count.participatingRounds,
        totalRounds: _count.playerProfiles
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, email } = req.body;

    // Validate input
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await req.prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        res.status(409).json({ message: 'Email is already in use' });
        return;
      }
    }

    // Update user profile
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get current user with password hash
    const user = await req.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await req.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};