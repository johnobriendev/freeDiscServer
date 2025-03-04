// src/middleware/validate.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format and return validation errors
    res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: (err as any).path || (err as any).param,
        message: err.msg
      }))
    });
  };
};