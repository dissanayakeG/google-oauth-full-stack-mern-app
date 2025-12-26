import { Router } from 'express';
import commonRoutes from './common.routes';
import webhooksRoutes from './webhooks.routes';

const router = Router();

router.use('/', commonRoutes);
router.use('/api/webhooks', webhooksRoutes);

export default router;
