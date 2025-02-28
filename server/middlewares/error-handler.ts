import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
