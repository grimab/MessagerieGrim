'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Utilisateurs', 'RoleID', {
      type: Sequelize.INTEGER,
      defaultValue: 1, // 1 pour les utilisateurs normaux
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Utilisateurs', 'RoleID');
  }
};