import pino from "pino";
import Environment from "../config/env.config";

console.table(Environment);

const isProduction = Environment.NODE_ENV === "production";

export const logger = pino({
    level: isProduction ? "info" : "debug",
    transport: isProduction ? undefined : {
        target: "pino-pretty",
        options: {
            colorize: true,
            // translateTime: "SYS:standard",
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: "pid,hostname",
        },
    }
});