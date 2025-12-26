'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmailBodies', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      emailId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Emails', key: 'id' },
        onDelete: 'CASCADE',
      },
      html: { type: Sequelize.TEXT('long') }, // Use LONGTEXT for full HTML emails
      text: { type: Sequelize.TEXT('long') }, // Plain text fallback
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmailBodies');
  },
};
