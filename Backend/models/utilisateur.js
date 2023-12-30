'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {
    static associate(models) {
      // Chaque utilisateur a plusieurs messages
      this.hasMany(models.Message, { foreignKey: 'ID_User', as: 'Messages' });

      // Chaque utilisateur a plusieurs contacts
      this.hasMany(models.Contact, { foreignKey: 'ID_User', as: 'Contacts' });

      // Chaque utilisateur a plusieurs conversations
      this.hasMany(models.Conversation, { foreignKey: 'ID_User', as: 'Conversations' });

      
    }
  }

  Utilisateur.init({
    ID_User: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Prenom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Date_de_derniere_connexion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Statut: {
      type: DataTypes.ENUM('En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible'),
      defaultValue: 'Hors ligne'
    },
    Image_de_profil: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    RoleID: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1 pour les utilisateurs normaux
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Utilisateur',
  });

  return Utilisateur;
};
