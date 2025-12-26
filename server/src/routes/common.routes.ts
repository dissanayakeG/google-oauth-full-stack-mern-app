import { apiResponse } from '@/utils/api.response';
import { Router } from 'express';

const commonRoutes = Router();

commonRoutes.get('/health-check', (req, res) => {
  return apiResponse({
    res,
    data: null,
    message: 'API is healthy',
    status: 200,
  });
});

export default commonRoutes;
