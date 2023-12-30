'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Utilisateurs', {
      ID_User: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
      Nom: {
        type: Sequelize.STRING
      },
      Prenom: {
        type: Sequelize.STRING
      },
      Email: {
        type: Sequelize.STRING
      },
      hashedPassword: {
        type: Sequelize.STRING
      },
      Date_de_creation: {
        type: Sequelize.DATE
      },
      Date_de_derniere_connexion: {
        type: Sequelize.DATE
      },
      Statut: {
        type: Sequelize.ENUM('En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible')
      },      
      Image_de_profil: {
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
    await queryInterface.dropTable('Utilisateurs');
  }
};