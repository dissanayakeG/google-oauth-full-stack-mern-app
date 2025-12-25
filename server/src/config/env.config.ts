import dotenv from 'dotenv';
import { z } from 'zod';
// import { logger } from '../utils/logger';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().min(1, "PORT is required"),
    FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),

    // Refresh and access token
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
    ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

    // Database
    DB_HOST: z.string().min(1, "DB_HOST is required"),
    DB_USER: z.string().min(1, "DB_USER is required"),
    DB_PASSWORD: z.string().optional(), //Todo : add min later, this is for dev purpose
    DB_NAME: z.string().min(1, "DB_NAME is required"),
    DB_PORT: z.string().min(1, "DB_PORT is required"),

    // Google
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    GOOGLE_REDIRECT_URL: z.string().url("GOOGLE_REDIRECT_URL must be a valid URL"),

    GOOGLE_PUSH_NOTIFICATION_PROJECT_ID: z.string().min(1, "GOOGLE_PUSH_NOTIFICATION_PROJECT_ID is required"),
    GOOGLE_PUSH_NOTIFICATION_TOPIC_NAME: z.string().min(1, "GOOGLE_PUSH_NOTIFICATION_TOPIC_NAME is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    result.error.issues.forEach(issue =>
        console.error(` - ${issue.path.join('.')}: ${issue.message}`)
    );
    console.error("Environment configuration issue");
    process.exit(1);
}

const Environment = result.data;
console.table(Environment)

export type EnvironmentType = z.infer<typeof envSchema>;

export default Environment;
