import { connetDB } from './src/config/db/db.config';
import Environment from './src/config/env.config';
import app from './src/index';
import { logger } from './src/utils/logger';

async function bootstrap() {
    try {
        await connetDB();

        app.listen(Environment.PORT, () => {
            logger.info("Server started on port:" + `http://localhost:${Environment.PORT}`);
        });

    } catch (error) {
        logger.fatal({ error }, "Failed to start server:");
        process.exit(1);
    }
}

bootstrap();
