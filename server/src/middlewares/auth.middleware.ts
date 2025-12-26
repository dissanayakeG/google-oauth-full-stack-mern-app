import Environment from '@/config/env.config';
import { UnauthorizedError } from '@/errors/UnauthorizedError';
import { User, JwtPayload } from '@/types';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export default function jwtAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    const { userId, email } = jwt.verify(token, Environment.JWT_SECRET) as JwtPayload;
    req.user = { userId, email };
    next();
  } catch {
    throw new UnauthorizedError();
  }
}
