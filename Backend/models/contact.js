'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      // Chaque contact a un utilisateur principal
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User', as: 'UtilisateurPrincipal' }); 
      
      // Chaque contact a un utilisateur contact
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_Contact_User', as: 'UtilisateurContact' });
    }
  }
  Contact.init({
    ID_Contact: {
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
    ID_Contact_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'ID_User'
      }
    },
    Statut: {
      type: DataTypes.ENUM,
      values: ['Ami', 'En attente', 'Bloqué'],
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};
