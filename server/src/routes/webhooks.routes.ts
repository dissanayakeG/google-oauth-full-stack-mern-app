import { Router } from 'express';
import { WebhookController } from '@/controllers/webhook.controller';
import Environment from '@/config/env.config';

const webhooksRoutes = Router();

const webhookController = new WebhookController();

webhooksRoutes.post(Environment.GMAIL_WEBHOOK_PATH, webhookController.receiveGmailPush);

export default webhooksRoutes;
