import { ZodObject, ZodRawShape, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      const zodError = err as ZodError;

      // reqLogger.warn(
      //     { err, body: req.body, method: req.method, url: req.url },
      //     'Validation failed dd'
      // );

      return res.status(400).json({ message: 'Validation failed fgfg', errors: zodError.errors });
    }
  };
