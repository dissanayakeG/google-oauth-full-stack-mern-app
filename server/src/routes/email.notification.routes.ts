import { Router } from "express";
import { EmailSyncController } from "../controllers/email.sync.controller";

const router = Router();

const emailSyncController = new EmailSyncController();

router.post('/gmail/push', emailSyncController.handleGmailPushNotification);

export default router;