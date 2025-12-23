import { AppError } from "./AppError";

export class CSRFError extends AppError {
  constructor() {
    super('Invalid OAuth state', 403);
  }
}