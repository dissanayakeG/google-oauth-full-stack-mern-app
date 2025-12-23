'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Users', {
      id: { primaryKey: true, autoIncrement: false, type: Sequelize.STRING },
      name: Sequelize.STRING,
      email: Sequelize.STRING,
      picture: Sequelize.STRING,
      googleId: { type: Sequelize.STRING, allowNull: true, unique: true },
      refreshToken: { type: Sequelize.TEXT, allowNull: true },
      preferences: { type: Sequelize.JSON, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
