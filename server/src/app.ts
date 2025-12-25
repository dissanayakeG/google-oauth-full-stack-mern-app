import Environment from "./config/env.config";
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { AppError } from "./errors/AppError";
import { requestLogger } from "./middlewares/requestLogger";
import rateLimiter from "./middlewares/rateLimiter";
// import commonRoutes from "./routes/common.routes";
// import emailNotificationRoutes from "./routes/email.notification.routes";
import routerV1 from "./routes/v1";
import router from "./routes";


const app = express();

//these two required to access the req.body
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Credentials',
    'X-CSRF-Token'
  ],
}));

app.use(
  session({
    secret: Environment.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,      // use true HTTPS
      httpOnly: true,
      sameSite: 'lax',    // this allows redirects from Google to preserve the cookie
    },
  })
);

app.use(cookieParser());

// Logger middleware
app.use(requestLogger);

// Routes
app.use(router)

//hanlde gmail push notification
// app.use('/api', emailNotificationRoutes);

//TODO : add shlow down middleware
app.use('/api/v1', rateLimiter, routerV1);

// Runs only if no route matched
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
