'use strict';

/** @type {import('sequelize-cli').Migration} */
// // Exportation d'un objet contenant deux fonctions : up et down
// module.exports = {
//   // La fonction up est utilisée pour définir ce qui doit être fait lors de l'exécution de la migration
//   async up(queryInterface, Sequelize) {
//     // Création d'une nouvelle table appelée 'Utilisateurs'
//     await queryInterface.createTable('Utilisateurs', {
//       // Colonne ID_User : Identifiant unique pour chaque utilisateur
//       ID_User: {
//         allowNull: false,       // Cette colonne ne peut pas être NULL
//         autoIncrement: true,    // Elle s'incrémente automatiquement
//         primaryKey: true,       // C'est une clé primaire
//         type: Sequelize.INTEGER // Type de données : entier
//       },
//       // Colonne Nom : Nom de l'utilisateur
//       Nom: {
//         type: Sequelize.STRING(100), // Chaîne de caractères avec une longueur maximale de 100
//         allowNull: false             // Cette colonne ne peut pas être NULL
//       },
//       // Colonne Prenom : Prénom de l'utilisateur
//       Prenom: {
//         type: Sequelize.STRING(100), // Chaîne de caractères avec une longueur maximale de 100
//         allowNull: false             // Cette colonne ne peut pas être NULL
//       },
//       // Colonne Email : Adresse e-mail de l'utilisateur
//       Email: {
//         type: Sequelize.STRING(100), // Chaîne de caractères avec une longueur maximale de 100
//         allowNull: false,            // Cette colonne ne peut pas être NULL
//         unique: true,                // Les valeurs doivent être uniques
//         validate: {
//           isEmail: true              // Doit être une adresse e-mail valide
//         }
//       },
//       // Colonne hashedPassword : Mot de passe haché de l'utilisateur
//       hashedPassword: {
//         type: Sequelize.STRING(255),  // Chaîne de caractères
//         allowNull: false         // Cette colonne ne peut pas être NULL
//       },
//       // Colonne Date_de_derniere_connexion : Dernière date de connexion de l'utilisateur
//       Date_de_derniere_connexion: {
//         type: Sequelize.DATE,
//         defaultValue:Sequelize.NOW    // Date et heure par défaut : la date et l'heure actuelles
//       },
//       // Colonne Statut : Statut actuel de l'utilisateur (par exemple, "En ligne")
//       Statut: {
//         type: Sequelize.ENUM('En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible'), // Seules ces valeurs sont autorisées
//         defaultValue: 'Hors ligne'  // Valeur par défaut : "Hors ligne"
//       },      
//       // Colonne Image_de_profil : Chemin vers l'image de profil de l'utilisateur
//       Image_de_profil: {
//         type: Sequelize.STRING, // Chaîne de caractères
//         allowNull: true     //  Cette colonne peut être NULL
//       },
//       // Colonne createdAt : Date et heure de création de l'enregistrement
//       createdAt: {
//         allowNull: false,           // Cette colonne ne peut pas être NULL
//         type: Sequelize.DATE,       // Date et heure
//         defaultValue: Sequelize.NOW // Valeur par défaut : la date et l'heure actuelles
//       },
//       // Colonne updatedAt : Date et heure de la dernière mise à jour de l'enregistrement
//       updatedAt: {
//         allowNull: false,           // Cette colonne ne peut pas être NULL
//         type: Sequelize.DATE,       // Date et heure
//         defaultValue: Sequelize.NOW  // Valeur par défaut : la date de creation 
//       }
//     });
//   },
//   // La fonction down est utilisée pour définir ce qui doit être fait pour annuler les changements apportés par la fonction up
//   async down(queryInterface, Sequelize) {
//     // Suppression de la table 'Utilisateurs'
//     await queryInterface.dropTable('Utilisateurs');
//   }
// };


// 'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Suppression de la colonne "Date_de_creation" :
    await queryInterface.removeColumn('Utilisateurs', 'Date_de_creation');

    // Modification de la colonne "Nom" :
    await queryInterface.changeColumn('Utilisateurs', 'Nom', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    // Modification de la colonne "Prenom" :
    await queryInterface.changeColumn('Utilisateurs', 'Prenom', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    // Modification de la colonne "Email" :
    await queryInterface.changeColumn('Utilisateurs', 'Email', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    });

    // Modification de la colonne "hashedPassword" :
    await queryInterface.changeColumn('Utilisateurs', 'hashedPassword', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    // Modification de la colonne "Date_de_derniere_connexion" :
    await queryInterface.changeColumn('Utilisateurs', 'Date_de_derniere_connexion', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    // Modification de la colonne "Statut" :
    await queryInterface.changeColumn('Utilisateurs', 'Statut', {
      type: Sequelize.ENUM('En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible'),
      defaultValue: 'Hors ligne'
    });

    // Modification de la colonne "Image_de_profil" :
    await queryInterface.changeColumn('Utilisateurs', 'Image_de_profil', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Modification de la colonne "createdAt" :
    await queryInterface.changeColumn('Utilisateurs', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    // Modification de la colonne "updatedAt" :
    await queryInterface.changeColumn('Utilisateurs', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down(queryInterface, Sequelize) {
    // Ajout de la colonne "Date_de_creation" :
    await queryInterface.addColumn('Utilisateurs', 'Date_de_creation', {
      type: Sequelize.DATE
    });

    // Revenir à l'état initial pour la colonne "Nom" :
    await queryInterface.changeColumn('Utilisateurs', 'Nom', {
      type: Sequelize.STRING
    });

    // Revenir à l'état initial pour la colonne "Prenom" :
    await queryInterface.changeColumn('Utilisateurs', 'Prenom', {
      type: Sequelize.STRING
    });

    // Revenir à l'état initial pour la colonne "Email" :
    await queryInterface.changeColumn('Utilisateurs', 'Email', {
      type: Sequelize.STRING
    });

    // Revenir à l'état initial pour la colonne "hashedPassword" :
    await queryInterface.changeColumn('Utilisateurs', 'hashedPassword', {
      type: Sequelize.STRING
    });

    // Revenir à l'état initial pour la colonne "Date_de_derniere_connexion" :
    await queryInterface.changeColumn('Utilisateurs', 'Date_de_derniere_connexion', {
      type: Sequelize.DATE
    });

    // Revenir à l'état initial pour la colonne "Statut" :
    await queryInterface.changeColumn('Utilisateurs', 'Statut', {
      type: Sequelize.ENUM('En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible')
    });

    // Revenir à l'état initial pour la colonne "Image_de_profil" :
    await queryInterface.changeColumn('Utilisateurs', 'Image_de_profil', {
      type: Sequelize.STRING
    });

    // Revenir à l'état initial pour la colonne "createdAt" :
    await queryInterface.changeColumn('Utilisateurs', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE
    });

    // Revenir à l'état initial pour la colonne "updatedAt" :
    await queryInterface.changeColumn('Utilisateurs', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE
    });
  }
};
