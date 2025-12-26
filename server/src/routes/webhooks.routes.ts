import { Router } from 'express';
import { WebhookController } from '@/controllers/webhook.controller';

const webhooksRoutes = Router();

const webhookController = new WebhookController();

webhooksRoutes.post('/gmail/push', webhookController.receiveGmailPush);

export default webhooksRoutes;
