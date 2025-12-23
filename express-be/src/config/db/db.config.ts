import { Sequelize } from "sequelize";
import Environment from "../env.config";
import { initUserModel } from '../../models/user'
import { logger } from "../../utils/logger";

const sequelize = new Sequelize(
    Environment.DB_NAME,
    Environment.DB_USER,
    Environment.DB_PASSWORD,
    {
        host: Environment.DB_HOST,
        port: Number(Environment.DB_PORT),
        dialect: 'mysql',
    }
)

export const connetDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connected');

        await sequelize.sync({ force: false });
        logger.info('Database synchronized');

    } catch (error) {
        logger.error(`Unable to connect to the database:' ${error}`);
    }
}

export const User = initUserModel(sequelize);

export default sequelize;