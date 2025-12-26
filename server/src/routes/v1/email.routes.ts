import { Router } from 'express';
import { EmailController } from '@/controllers/email.controller';

const emailRoutes = Router();

const emailController = new EmailController();

emailRoutes.get('/labels', emailController.getGmailLabels);
emailRoutes.get('/list', emailController.listUserEmails);
emailRoutes.get('/:id', emailController.getEmailById);

export default emailRoutes;
