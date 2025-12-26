import Environment from './config/env.config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import rateLimiter from './middlewares/rate-limiter.middleware';
import routerV1 from './routes/v1';
import router from './routes';
import { NotFoundError } from './errors/NotFoundError';

const app = express();

app.use(express.json()); // to parse application/json, otherwise req.body will be undefined

// Required for cross-origin browser requests
app.use(
  cors({
    origin: Environment.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Credentials',
      'X-CSRF-Token',
    ],
  })
);

app.use(
  session({
    secret: Environment.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: Environment.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(cookieParser());

// Logger middleware
app.use(requestLogger);

// Routes
app.use(router);

//TODO : add shlow down middleware
app.use('/api/v1', rateLimiter, routerV1);

// Runs only if no route matched
app.use((req) => {
  throw new NotFoundError(`Route not found - ${req.originalUrl}`);
});

// Global error handler
app.use(globalErrorHandler);

export default app;
