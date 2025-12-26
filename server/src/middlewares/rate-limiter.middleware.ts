import rateLimit from 'express-rate-limit';
import Environment from '@/config/env.config';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: Number(Environment.RATE_LIMITER_MAX_REQUESTS),
  message: 'Too many refresh attempts, try again later',
});

export default rateLimiter;
