'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MembreGroupe extends Model {
    static associate(models) {
      // Chaque MembreGroupe appartient à un Groupe
      this.belongsTo(models.Groupe, { foreignKey: 'ID_Groupe' });
      
      // Chaque MembreGroupe a un Utilisateur comme membre
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });
    }
  }
  MembreGroupe.init({
    ID_Groupe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Groupes',
        key: 'ID_Groupe'
      }
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Utilisateurs',
        key: 'ID_User'
      }
    },
    Rôle: {
      type: DataTypes.ENUM,
      values: ['Admin', 'Membre'],
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MembreGroupe',
    tableName: 'MembreGroupes',
    timestamps: true, 
    freezeTableName: true 
  });
  return MembreGroupe;
};
