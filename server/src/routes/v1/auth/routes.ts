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

router.get('/gmail/labels', jwtAuth, oAuthController.getGmailLabels);
router.get('/gmail/emails', jwtAuth, oAuthController.getGmailEmails);

export default router;