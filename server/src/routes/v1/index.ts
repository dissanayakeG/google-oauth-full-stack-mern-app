import { Router } from 'express';
import oAuthRoutes from './auth.routes';
import emailRoutes from './email.routes';
import jwtAuth from '@/middlewares/auth.middleware';

const routerV1 = Router();

routerV1.use('/auth', oAuthRoutes);
routerV1.use('/email', jwtAuth, emailRoutes);

export default routerV1;
