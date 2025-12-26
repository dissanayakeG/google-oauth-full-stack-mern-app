import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@/errors/BadRequestError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError(`${result.error.issues.map((e) => e.message).join(', ')}`);
    }

    next();
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      throw new BadRequestError(`${result.error.issues.map((e) => e.message).join(', ')}`);
    }

    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new BadRequestError(`${result.error.issues.map((e) => e.message).join(', ')}`);
    }

    next();
  };
};
