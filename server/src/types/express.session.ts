import 'express-session';

declare module 'express-session' {
  interface SessionData {
    state?: string;
    credentials?: unknown;
    userId?: string;
  }
}

//extending the existing SessionData interface that comes from express-session. TypeScript automatically merges your additions with the original type.
