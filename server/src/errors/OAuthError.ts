import { AppError } from "./AppError";

export class OAuthError extends AppError {
  constructor(message = 'OAuth failed') {
    super(message, 401);
  }
}