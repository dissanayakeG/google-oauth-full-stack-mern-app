import {Router} from 'express'
import commonRoutes from './common.routes'
import webhooks from './webhooks.routes'

const router = Router();

router.use('/', commonRoutes);
router.use('/api', webhooks);

export default router;