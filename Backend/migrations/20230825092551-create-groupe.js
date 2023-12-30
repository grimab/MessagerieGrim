'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Groupes', {
      ID_Groupe: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Nom_du_groupe: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ID_Admin: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateurs',
          key: 'ID_User'
        }
      },
      Description_du_groupe: {
        type: Sequelize.TEXT
      },
      Image_du_groupe: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Groupes');
  }
};
