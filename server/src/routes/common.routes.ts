
import { Router } from "express";

const commonRoutes = Router();

commonRoutes.get('/health-check', (req, res) => {
    res.send("Hello World!");
});

export default commonRoutes;

