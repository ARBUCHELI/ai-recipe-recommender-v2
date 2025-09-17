import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`Error: ${err.message}`);

  // Prisma validation error
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const message = 'Duplicate field value entered';
      error = { statusCode: 400, message } as CustomError;
    } else if (err.code === 'P2025') {
      const message = 'Record not found';
      error = { statusCode: 404, message } as CustomError;
    } else {
      const message = 'Database error';
      error = { statusCode: 400, message } as CustomError;
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    error = { statusCode: 400, message } as CustomError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { statusCode: 401, message } as CustomError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { statusCode: 401, message } as CustomError;
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};