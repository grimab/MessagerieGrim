'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HistoriqueChangementMotDePasse extends Model {
    static associate(models) {
      // Chaque entrée historique appartient à un Utilisateur
      this.belongsTo(models.Utilisateur, { foreignKey: 'ID_User' });
    }
  }

  HistoriqueChangementMotDePasse.init({
    ID_Historique: {
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
    Ancien_mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false
      // Note:  gérer le cryptage de ce mot de passe dans la logique métier avant de l'enregistrer dans la base de données.
    },
    Nouveau_mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false
      // Note:  gérer le cryptage de ce mot de passe avant de l'enregistrer.
    },
    Date_et_heure: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'HistoriqueChangementMotDePasse',
  });

  return HistoriqueChangementMotDePasse;
};
