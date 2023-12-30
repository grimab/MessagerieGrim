'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      ID_Notification: {
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
      Type_notification: {
        type: Sequelize.ENUM('Message non lu', 'Invitation à un groupe'),
        allowNull: false
      },
      Date_et_heure: {
        allowNull: false,
        type: Sequelize.DATE
      },
      Lu: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('Notifications');
  }
};


//  * TODO Notifications
//  *
// Demande d'amitié : Lorsqu'un utilisateur souhaite devenir ami avec un autre.
// Acceptation d'amitié : Lorsqu'une demande d'amitié est acceptée.
// Message de groupe : Lorsqu'un nouveau message est posté dans un groupe auquel l'utilisateur appartient.
// Mention : Lorsqu'un utilisateur est mentionné dans un message ou un commentaire.
// Réactions : Lorsqu'un utilisateur réagit à un message ou un post (par exemple, aime, partage, etc.).
// Changement de statut d'un contact : Lorsqu'un contact change son statut (par exemple, passe en ligne).
// Alertes de sécurité : Notifications concernant les activités suspectes, les tentatives de connexion, les modifications de mot de passe, etc.