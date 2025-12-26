import { Request, Response } from 'express';
import { apiResponse } from '@/utils/api.response';

export class UserController {
  me = async (req: Request, res: Response) => {
    return apiResponse({
      res,
      data: { user: req.user },
      message: 'User fetched successfully',
      status: 200,
    });
  };
}
