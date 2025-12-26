'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Emails', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      threadId: { type: Sequelize.STRING }, // Gmail's Thread ID
      messageId: { type: Sequelize.STRING, unique: true }, // Gmail's unique Message-ID
      subject: { type: Sequelize.STRING },
      sender: { type: Sequelize.STRING },
      recipient: { type: Sequelize.STRING },
      snippet: { type: Sequelize.TEXT }, // Short preview for inbox list
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      dateReceived: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Emails');
  },
};
