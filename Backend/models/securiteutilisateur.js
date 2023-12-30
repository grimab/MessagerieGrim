'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SecuriteUtilisateur extends Model {
    static associate(models) {
      // Chaque SecuriteUtilisateur appartient à un Utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });
    }
  }

  SecuriteUtilisateur.init({
    ID_Sécurité: {
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
    Question_securite: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Reponse_securite: {
      type: DataTypes.STRING,
      allowNull: false
      // Note:  gérer le cryptage de cette réponse dans votre logique métier avant de l'enregistrer dans la base de données.
    }
  }, {
    sequelize,
    modelName: 'SecuriteUtilisateur',
  });

  return SecuriteUtilisateur;
};
