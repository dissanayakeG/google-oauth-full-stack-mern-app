import { Router } from "express";
import { EmailController } from "../controllers/email.controller";

const router = Router();

const emailController = new EmailController();

router.post('/gmail/push', emailController.handleGmailPushNotification);

export default router;