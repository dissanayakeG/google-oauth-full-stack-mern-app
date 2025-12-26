import { Router } from 'express';
import { OAuthController } from '@/controllers/oauth.controller';
import jwtAuth from '@/middlewares/auth.middleware';

const oAuthRoutes = Router();

const oAuthController = new OAuthController();

oAuthRoutes.get('/google', oAuthController.login);
oAuthRoutes.get('/google/callback', oAuthController.handleGoogleCallback);
oAuthRoutes.get('/me', jwtAuth, oAuthController.authUser);
oAuthRoutes.post('/refresh', oAuthController.refresh);
oAuthRoutes.post('/logout', jwtAuth, oAuthController.logout);

export default oAuthRoutes;
