'use strict';

/** @type {import('sequelize-cli').Migration} */






module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Messages', {
      fields: ['ID_Conversation'],
      type: 'foreign key',
      name: 'Messages_ibfk_1',
      references: {
        table: 'Conversations', // Nom de la table de référence
        field: 'ID_Conversation' // Champ de la table de référence
      },
      onDelete: 'CASCADE', // ou 'SET NULL', 'NO ACTION', selon la logique de votre application
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('PieceJointes', {
      fields: ['ID_Message'],
      type: 'foreign key',
      name: 'PieceJointes_ibfk_1',
      references: {
        table: 'Messages',
        field: 'ID_Message'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Messages', 'Messages_ibfk_1');
    await queryInterface.removeConstraint('PieceJointes', 'PieceJointes_ibfk_1');
  }
};


// module.exports = {
//   up: async (queryInterface, Sequelize) => {
  

//     // Ajouter la suppression en cascade pour la clé étrangère ID_Conversation dans la table Messages
//     // await queryInterface.removeConstraint('Messages', 'Messages_ibfk_1');
//     await queryInterface.addConstraint('Messages', {
//       fields: ['ID_Conversation'],
//       type: 'foreign key',
//       name: 'Messages_ibfk_1',
//       references: {
//         table: 'Conversations',
//         key: 'ID_Conversation'
//       },
//       onDelete: 'CASCADE'
//     });

//     // Ajouter la suppression en cascade pour la clé étrangère ID_Message dans la table PieceJointes
//     await queryInterface.removeConstraint('PieceJointes', 'PieceJointes_ibfk_1');
//     await queryInterface.addConstraint('PieceJointes', {
//       fields: ['ID_Message'],
//       type: 'foreign key',
//       name: 'PieceJointes_ibfk_1',
//       references: {
//         table: 'Messages',
//         key: 'ID_Message'
//       },
//       onDelete: 'CASCADE'
//     });
//   },

//   down: async (queryInterface, Sequelize) => {

//     // Inverser les changements pour la suppression en cascade
//     // await queryInterface.removeConstraint('Messages', 'Messages_ibfk_1');
//     await queryInterface.addConstraint('Messages', {
//       fields: ['ID_Conversation'],
//       type: 'foreign key',
//       name: 'Messages_ibfk_1',
//       references: {
//         table: 'Conversations',
//         key: 'ID_Conversation'
//       }
//     });

//     // Inverser les changements pour PieceJointes
//     await queryInterface.removeConstraint('PieceJointes', 'PieceJointes_ibfk_1');
//     await queryInterface.addConstraint('PieceJointes', {
//       fields: ['ID_Message'],
//       type: 'foreign key',
//       name: 'PieceJointes_ibfk_1',
//       references: {
//         table: 'Messages',
//         key: 'ID_Message'
//       }
//     });
//   }
// };