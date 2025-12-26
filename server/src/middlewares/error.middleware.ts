import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';
import { apiResponse } from '@/utils/api.response';

export default function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
    },
    err.message
  );

  if (err instanceof AppError) {
    return apiResponse({
      res,
      data: null,
      message: err.message,
      status: err.statusCode,
    });
  }

  return apiResponse({
    res,
    data: null,
    message: err.message,
    status: 500,
  });
}
