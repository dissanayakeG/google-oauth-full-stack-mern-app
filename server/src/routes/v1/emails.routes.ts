import { Router } from 'express';
import { EmailController } from '@/controllers/email.controller';
import { validateParams, validateQuery } from '@/middlewares/validate.middleware';
import { emailIdParamsSchema, emailsQuerySchema } from '@/dtos/email.dto';

const emailsRoutes = Router();

const emailController = new EmailController();

emailsRoutes.get('/', validateQuery(emailsQuerySchema), emailController.index);

emailsRoutes.get('/:id', validateParams(emailIdParamsSchema), emailController.show);

emailsRoutes.get('/labels', emailController.labels);

export default emailsRoutes;
