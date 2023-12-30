'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Groupe extends Model {
    static associate(models) {
      // Chaque groupe a un administrateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_Admin', as: 'Administrateur' });
    }
  }
  Groupe.init({
    ID_Groupe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nom_du_groupe: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ID_Admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'ID_User'
      }
    },
    Description_du_groupe: {
      type: DataTypes.TEXT
    },
    Image_du_groupe: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Groupe',
  });
  return Groupe;
};
