import pino from 'pino';
import path from 'path';
import fs from 'fs';
import Environment from '@/config/env.config';

const isProduction = Environment.NODE_ENV === 'production';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
});

export const httpLogger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: {
      destination: path.join(logsDir, 'http.log'),
      mkdir: true,
    },
  },
});
