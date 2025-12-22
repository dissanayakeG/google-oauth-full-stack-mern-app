import dotenv from 'dotenv'
dotenv.config();

type Environment = {
    PORT: string;

    DB_HOST: string,
    DB_USER: string,
    DB_PASSWORD: string,
    DB_NAME: string,
    DB_PORT: string,
}

const Environment :Environment  = {
    PORT: process.env.PORT!,

    // Database
    DB_HOST: process.env.DB_HOST!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT: process.env.DB_PORT!,
}

export default Environment;