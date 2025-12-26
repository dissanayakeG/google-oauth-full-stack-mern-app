import 'express-session';

//extending the existing SessionData interface that comes from express-session.
declare module 'express-session' {
  interface SessionData {
    state?: string;
    credentials?: unknown;
    userId?: string;
  }
}
