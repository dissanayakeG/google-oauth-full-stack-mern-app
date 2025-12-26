import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import jwtAuth from '@/middlewares/auth.middleware';

const authRoutes = Router();

const authController = new AuthController();

authRoutes.get('/google', authController.redirectToGoogle);

authRoutes.get('/google/callback', authController.handleCallback);

authRoutes.post('/refresh', authController.refreshToken);

authRoutes.post('/logout', jwtAuth, authController.logout);

export default authRoutes;
