import { Router } from "express";
import { OAuthController } from "../../../controllers/oauth.controller";

const router = Router();

const oAuthController = new OAuthController()

router.get('/google', oAuthController.login);
router.get('/google/callback', oAuthController.callback);

export default router;