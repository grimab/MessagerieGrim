'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageGroupe extends Model {
    static associate(models) {
      // Chaque MessageGroupe appartient à un Groupe
      this.belongsTo(models.Groupe, { foreignKey: 'ID_Groupe' });
      
      // Chaque MessageGroupe a un Utilisateur comme expéditeur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });
    }
  }
  MessageGroupe.init({
    ID_Message: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_Groupe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groupes',
        key: 'ID_Groupe'
      }
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'ID_User'
      }
    },
    Contenu_du_message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Date_et_heure: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Statut_du_message: {
      type: DataTypes.ENUM,
      values: ['Envoyé', 'Reçu', 'Lu'],
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MessageGroupe',
  });
  return MessageGroupe;
};
