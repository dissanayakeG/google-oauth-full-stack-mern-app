import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const webhooks = Router();

const webhookController = new WebhookController();

webhooks.post('/gmail/push', webhookController.handleGmailWebhooks);
export default webhooks;