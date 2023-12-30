'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PieceJointe extends Model {
    static associate(models) {
      // Chaque PieceJointe peut appartenir à un Message ou à un MessageGroupe
      this.belongsTo(models.Message, { foreignKey: 'ID_Message' });
      this.belongsTo(models.MessageGroupe, { foreignKey: 'ID_MessageGroupe' });
    }
  }

  PieceJointe.init({
    ID_PieceJointe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_Message: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'ID_Message'
      }
    },
    ID_MessageGroupe: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'MessageGroupes',
        key: 'ID_Message'
      }
    },
    Type_piece_jointe: {
      type: DataTypes.ENUM,
      values: ['Image', 'Vidéo', 'Audio', 'Document'],
      allowNull: false
    },
    Chemin_du_fichier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Taille_du_fichier: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PieceJointe',
  });

  return PieceJointe;
};
