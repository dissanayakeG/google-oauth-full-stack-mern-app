import { Response } from 'express';

interface ResponseParams<T> {
  res: Response;
  data: T;
  message?: string;
  status?: number;
}

export const apiResponse = <T>({
  res,
  data,
  message = 'Success',
  status = 200,
}: ResponseParams<T>) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};
