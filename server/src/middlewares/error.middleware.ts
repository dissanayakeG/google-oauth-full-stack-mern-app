import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';

export default function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isAppError = err instanceof AppError;

  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
    },
    err.message
  );

  if (isAppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...('details' in err && { errors: (err as AppError & { details?: unknown }).details }),
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error11',
  });
}
