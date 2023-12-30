

'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {  
    static associate(models) {
      // Associations avec Utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User1', as: 'Utilisateur1' });
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User2', as: 'Utilisateur2' });

      // Suppression en cascade des messages liés à la conversation
      this.hasMany(models.Message, {
        foreignKey: 'ID_Conversation',
        as: 'Messages',
        onDelete: 'CASCADE'
      });
    }
  }

  Conversation.init({
    ID_Conversation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ID_User1: DataTypes.INTEGER,
    ID_User2: DataTypes.INTEGER,
    Confidentialite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Par défaut privé
    },
    Dernier_message: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Conversation',
  });

  return Conversation;
};
