import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize';

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

  static associate(models: { Email: typeof Model }) {
    EmailBody.belongsTo(models.Email, { foreignKey: 'emailId' });
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
