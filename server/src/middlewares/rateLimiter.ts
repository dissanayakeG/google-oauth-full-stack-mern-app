import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  message: 'Too many refresh attempts, try again later',
});

export default rateLimiter;