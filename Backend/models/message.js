'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Chaque message appartient à une Conversation
      this.belongsTo(models.Conversation, { foreignKey: 'ID_Conversation' });
      
      // Chaque message a un Utilisateur comme expéditeur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });

      // Dans le modèle Message
Message.hasMany(models.PieceJointe, {
  foreignKey: 'ID_Message',
  as: 'PiecesJointes',
  onDelete: 'CASCADE'
});

    }
  }
  Message.init({
    ID_Message: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_Conversation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Conversations',
        key: 'ID_Conversation'
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
    modelName: 'Message',
  });
  return Message;
};
