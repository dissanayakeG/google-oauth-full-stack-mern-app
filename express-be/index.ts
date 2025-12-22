import Environment from "./config/env.config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/routes";
import testRoutes from "./routes/test";
import { connetDB } from "./config/db.config";

const app = express();

//these two required to access the req.body
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use('/test', testRoutes);
app.use('/auth', authRoutes);


connetDB().then(() => {
    app.listen(Environment.PORT, () => {
        console.log("Server started on port:" + `http://localhost:${Environment.PORT}`);
    });
})
