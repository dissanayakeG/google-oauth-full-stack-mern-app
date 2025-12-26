import Environment from './config/env.config';
import { connetDB } from './config/db.config';
import app from './app';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await connetDB();

    app.listen(Environment.PORT, () => {
      logger.info('Server started on port:' + `http://localhost:${Environment.PORT}`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server:');
    process.exit(1);
  }
}

bootstrap();
