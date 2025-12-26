export type JwtPayload = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export type User = {
  userId: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
