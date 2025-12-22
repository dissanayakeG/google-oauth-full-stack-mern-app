import { Router } from "express";
import { OAuthController } from "../../../controllers/oauth.controller";
import jwtAuth from "../../../middlewares/jwt.auth";

const router = Router();

const oAuthController = new OAuthController()

router.get('/google', oAuthController.login);
router.get('/google/callback', oAuthController.callback);

router.get('/me', jwtAuth, oAuthController.authUser);
router.post('/refresh', oAuthController.refresh);
router.post('/logout', oAuthController.logout);

export default router;