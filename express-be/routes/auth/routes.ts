import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller";

const router = Router();

const authController = new AuthController()

router.get('/login', authController.login);

export default router;