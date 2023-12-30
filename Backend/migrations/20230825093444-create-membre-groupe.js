'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MembreGroupes', {
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
      Rôle: {
        type: Sequelize.ENUM('Admin', 'Membre'),
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
    await queryInterface.dropTable('MembreGroupes');
  }
};
