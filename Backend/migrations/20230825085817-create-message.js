'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      ID_Message: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ID_Conversation: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversations',
          key: 'ID_Conversation'
        }
      },
      ID_User: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateurs',
          key: 'ID_User'
        }
      },
      Contenu_du_message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Date_et_heure: {
        allowNull: false,
        type: Sequelize.DATE
      },
      Statut_du_message: {
        type: Sequelize.ENUM('Envoyé', 'Reçu', 'Lu'),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};
