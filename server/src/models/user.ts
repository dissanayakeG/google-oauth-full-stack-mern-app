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

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare picture?: string;
  declare googleId?: string;
  declare refreshToken?: string | null;
  declare googleRefreshToken?: string | null;
  declare googleAccessToken?: string | null;
  declare preferences?: object | null;
  declare gmailHistoryId?: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare emails?: NonAttribute<Email[]>;

  declare static associations: {
    emails: Association<User, Email>;
  };

  static associate(models: { Email: typeof Email }) {
    User.hasMany(models.Email, { foreignKey: 'userId', as: 'emails' });
  }
}

export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.STRING,
        autoIncrement: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, //only for dev testing,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      googleRefreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      googleAccessToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      preferences: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      gmailHistoryId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      indexes: [
        {
          name: 'idx_user_email',
          fields: ['email'],
        },
        {
          name: 'idx_user_googleId',
          fields: ['googleId'],
        },
      ],
    }
  );

  return User;
};
