import { AppError } from './AppError';

export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, 500, false);
  }
}
