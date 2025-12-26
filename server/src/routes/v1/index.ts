import { Router } from 'express';
import authRoutes from './auth.routes';
import emailsRoutes from './emails.routes';
import usersRoutes from './users.routes';
import jwtAuth from '@/middlewares/auth.middleware';

const routerV1 = Router();

routerV1.use('/auth', authRoutes);

routerV1.use('/users', usersRoutes);

routerV1.use('/emails', jwtAuth, emailsRoutes);

export default routerV1;
