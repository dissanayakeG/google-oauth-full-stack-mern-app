import { ZodObject, ZodRawShape } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validate = <T extends ZodRawShape>(schema: ZodObject<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err: any) {
            const reqLogger = (req as any).log ?? logger;

            reqLogger.warn(
                { err, body: req.body, method: req.method, url: req.url },
                'Validation failed dd'
            );

            return res.status(400).json({ message: 'Validation failed fgfg', errors: err.errors });
        }
    };
