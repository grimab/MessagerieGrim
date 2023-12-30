'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PieceJointes', {
      ID_PieceJointe: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ID_Message: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Peut être null si la pièce jointe est pour un MessageGroupe
        references: {
          model: 'Messages',
          key: 'ID_Message'
        }
      },
      ID_MessageGroupe: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Peut être null si la pièce jointe est pour un Message individuel
        references: {
          model: 'MessageGroupes',
          key: 'ID_Message'
        }
      },
      Type_piece_jointe: {
        type: Sequelize.ENUM('Image', 'Vidéo', 'Audio', 'Document'),
        allowNull: false
      },
      Chemin_du_fichier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Taille_du_fichier: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('PieceJointes');
  }
};
