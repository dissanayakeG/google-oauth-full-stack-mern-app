import { CreationOptional, InferAttributes, InferCreationAttributes, Model, Sequelize, DataTypes } from "sequelize";

export class Email extends Model<InferAttributes<Email>, InferCreationAttributes<Email>> {
    declare id: CreationOptional<number>;
    declare userId: string;
    declare threadId: string;
    declare messageId: string;
    declare subject: string;
    declare sender: string;
    declare recipient: string;
    declare snippet: string;
    declare isRead: boolean;
    declare dateReceived: Date;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    static associate(models: any) {
        Email.belongsTo(models.User, { foreignKey: 'userId' });
        Email.hasOne(models.EmailBody, { foreignKey: 'emailId', as: 'body' });
    }
}

export const initEmailModel = (sequelize: Sequelize) => {

    Email.init({
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.STRING, allowNull: false },
        threadId: { type: DataTypes.STRING, allowNull: false },
        messageId: { type: DataTypes.STRING, allowNull: false },
        subject: { type: DataTypes.STRING, allowNull: false },
        sender: { type: DataTypes.STRING, allowNull: false },
        recipient: { type: DataTypes.STRING, allowNull: false },
        snippet: { type: DataTypes.TEXT, allowNull: false },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        dateReceived: { type: DataTypes.DATE, allowNull: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        tableName: 'Emails',
        indexes: [
            {
                name: 'idx_email_userId_dateReceived',
                fields: ['userId', 'dateReceived'],
            },
            {
                name: 'idx_email_messageId',
                fields: ['messageId'],
            },
            {
                name: 'idx_email_isRead',
                fields: ['isRead'],
            },
            {
                name: 'idx_email_threadId',
                fields: ['threadId'],
            },
        ],
    });

    return Email;
}