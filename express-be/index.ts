import Environment from "./config/env.config";
import express from "express";
import cors from "cors";
import oAuthRoutes from "./routes/v1/auth/routes";
import testRoutes from "./routes/v1/test";
import { connetDB } from "./config/db/db.config";
import session from "express-session";
import cookieParser from 'cookie-parser';


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

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/v1/test', testRoutes);
app.use('/api/v1/auth', oAuthRoutes);

connetDB().then(() => {
    app.listen(Environment.PORT, () => {
        console.log("Server started on port:" + `http://localhost:${Environment.PORT}`);
    });
})
