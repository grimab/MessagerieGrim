'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Renommer la colonne Date_de_creation en Confidentialite
    await queryInterface.renameColumn('Conversations', 'Date_de_creation', 'Confidentialite');

    // Modifier le type de la colonne Confidentialite
    await queryInterface.changeColumn('Conversations', 'Confidentialite', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

   
  },

  async down (queryInterface, Sequelize) {
    // Inverser la modification du type de la colonne
    await queryInterface.changeColumn('Conversations', 'Confidentialite', {
      type: Sequelize.DATE
    });

    // Renommer la colonne Confidentialite en Date_de_creation
    await queryInterface.renameColumn('Conversations', 'Confidentialite', 'Date_de_creation');

    
  }
};
