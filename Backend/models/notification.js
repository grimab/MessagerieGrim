'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Chaque Notification appartient à un Utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });
    }
  }

  Notification.init({
    ID_Notification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'ID_User'
      }
    },
    Type_notification: {
      type: DataTypes.ENUM,
      values: ['Message non lu', 'Invitation à un groupe'],
      allowNull: false
    },
    Date_et_heure: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Lu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });

  return Notification;
};


//  *** TODO Notifications***
//  *
// Demande d'amitié : Lorsqu'un utilisateur souhaite devenir ami avec un autre.
// Acceptation d'amitié : Lorsqu'une demande d'amitié est acceptée.
// Message de groupe : Lorsqu'un nouveau message est posté dans un groupe auquel l'utilisateur appartient.
// Mention : Lorsqu'un utilisateur est mentionné dans un message ou un commentaire.
// Réactions : Lorsqu'un utilisateur réagit à un message ou un post (par exemple, aime, partage, etc.).
// Changement de statut d'un contact : Lorsqu'un contact change son statut (par exemple, passe en ligne).
// Alertes de sécurité : Notifications concernant les activités suspectes, les tentatives de connexion, les modifications de mot de passe, etc.