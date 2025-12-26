import { Request, Response } from 'express';

export class UserController {
  me = async (req: Request, res: Response) => {
    res.json({ user: req.user });
  };
}
