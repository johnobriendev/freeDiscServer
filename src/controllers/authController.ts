// src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth';
import { RegisterRequest, LoginRequest, RequestWithPrisma } from '../types';

export const register = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName }: RegisterRequest = req.body;
    const prisma = (req as RequestWithPrisma).prisma;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password }: LoginRequest = req.body;
    const prisma = (req as RequestWithPrisma).prisma;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const prisma = (req as RequestWithPrisma).prisma;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};