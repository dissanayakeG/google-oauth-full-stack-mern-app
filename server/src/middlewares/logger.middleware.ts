import pinoHttp from 'pino-http';
import { httpLogger } from '../utils/logger';


export const requestLogger = pinoHttp({

    logger: httpLogger,

    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },

});