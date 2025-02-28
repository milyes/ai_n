import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    const zodError = error as ZodError;
    return res.status(400).json({
      success: false,
      error: zodError.errors[0].message
    });
  }
};
