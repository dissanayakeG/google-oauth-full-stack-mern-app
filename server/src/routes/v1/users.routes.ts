import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import jwtAuth from '@/middlewares/auth.middleware';

const usersRoutes = Router();

const userController = new UserController();

usersRoutes.get('/me', jwtAuth, userController.me);

export default usersRoutes;
