import express from "express";
import cors from "cors";
import oAuthRoutes from "./routes/v1/auth/routes";
import testRoutes from "./routes/v1/test";
import session from "express-session";
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { AppError } from "./errors/AppError";
import { requestLogger } from "./middlewares/requestLogger";


const app = express();

//these two required to access the req.body
app.use(express.json());
// app.use(cors());

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
    secret: 'your-secret-key',
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

//All routes

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/v1/test', testRoutes);
app.use('/api/v1/auth', oAuthRoutes);

// 404
// app.all('*', (req, res, next) => {
//   next(new AppError(`Route ${req.originalUrl} not found`, 404));
// });

//Runs only if no route matched, above is now working in express 5
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// error handler LAST
app.use(globalErrorHandler);


export default app;
