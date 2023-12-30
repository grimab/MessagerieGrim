'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HistoriqueChangementMotDePasses', {
      ID_Historique: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ID_User: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateurs',
          key: 'ID_User'
        }
      },
      Ancien_mot_de_passe: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Nouveau_mot_de_passe: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Date_et_heure: {
        allowNull: false,
        type: Sequelize.DATE
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
    await queryInterface.dropTable('HistoriqueChangementMotDePasses');
  }
};
