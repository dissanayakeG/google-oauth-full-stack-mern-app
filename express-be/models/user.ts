import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare picture?: string;
  declare googleId?: string;
  declare refreshToken?: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // define associations here
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
        unique: false//only for dev testing,
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
    }
  );

  return User;
};
