import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err as any).details && { errors: (err as any).details },
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error11',
  });
}
