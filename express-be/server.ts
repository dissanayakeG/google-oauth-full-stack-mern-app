import { connetDB } from './config/db/db.config';
import Environment from './config/env.config';
import app from './index';
import { logger } from './utils/logger';


async function bootstrap() {
    try {
        await connetDB();

        const server = app.listen(Environment.PORT, () => {
            logger.info("Server started on port:" + `http://localhost:${Environment.PORT}`);
        });

    } catch (error) {
        logger.fatal({ error }, "Failed to start server:");
        process.exit(1);
    }
}

bootstrap();
