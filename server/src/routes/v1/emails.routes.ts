import { Router } from 'express';
import { EmailController } from '@/controllers/email.controller';
import { validateQuery } from '@/middlewares/validate.middleware';
import { querySchema } from '@/schemas/email.schema';

const emailsRoutes = Router();

const emailController = new EmailController();

emailsRoutes.get('/', validateQuery(querySchema), emailController.index);

emailsRoutes.get('/:id', emailController.show);

emailsRoutes.get('/labels', emailController.labels);

export default emailsRoutes;
