import dotenv from 'dotenv'
dotenv.config();

type Environment = {
    PORT: string;
    FRONTEND_URL:string,
    NODE_ENV: string,

    //refresh and access token
    JWT_SECRET: string,
    REFRESH_TOKEN_SECRET: string,
    ACCESS_TOKEN_EXPIRY: string,
    REFRESH_TOKEN_EXPIRY: string,

    // Database
    DB_HOST: string,
    DB_USER: string,
    DB_PASSWORD: string,
    DB_NAME: string,
    DB_PORT: string,

    // Google
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_REDIRECT_URL: string,
}

const Environment :Environment  = {
    PORT: process.env.PORT!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    NODE_ENV: process.env.NODE_ENV || 'development',

    //refresh and access token
    JWT_SECRET: process.env.JWT_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',

    // Database
    DB_HOST: process.env.DB_HOST!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT: process.env.DB_PORT!,

    // Google
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL!,
}

export default Environment;