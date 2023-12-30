'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MessageGroupes', {
      ID_Message: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ID_Groupe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groupes',
          key: 'ID_Groupe'
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
    await queryInterface.dropTable('MessageGroupes');
  }
};
