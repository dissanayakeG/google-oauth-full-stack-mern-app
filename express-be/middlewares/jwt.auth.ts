import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export default function jwtAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {

  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  console.log('JWT middleware hit!', token);

  if (!token) {
    res.status(401).json({ message: 'Access Denied: No token provided' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not defined!');
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
