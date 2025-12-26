import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  NonAttribute,
  Association,
} from 'sequelize';
import type { Email } from './email';

export class EmailBody extends Model<
  InferAttributes<EmailBody>,
  InferCreationAttributes<EmailBody>
> {
  declare id: CreationOptional<number>;
  declare emailId: number;
  declare html: string;
  declare text: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare email?: NonAttribute<Email>;

  declare static associations: {
    email: Association<EmailBody, Email>;
  };

  static associate(models: { Email: typeof Email }) {
    EmailBody.belongsTo(models.Email, { foreignKey: 'emailId', as: 'email' });
  }
}

export const initEmailBodyModel = (sequelize: Sequelize) => {
  EmailBody.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      emailId: { type: DataTypes.INTEGER, allowNull: false },
      html: { type: DataTypes.TEXT('long') },
      text: { type: DataTypes.TEXT('long') },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, modelName: 'EmailBody' }
  );
  return EmailBody;
};
