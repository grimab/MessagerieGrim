//contactController.js

const { Contact, Utilisateur, Groupe, MembreGroupe } = require("../../models"); // Vérifiez les chemins d'accès
const socketController = require("../sockets/socketController"); // Importez le contrôleur de socket si nécessaire
const { Op } = require("sequelize");

// Ajouter un contact
// exports.addContact = async (req, res) => {
//     try {
//         const { ID_User, ID_Contact_User } = req.body;

//         // Vérifier si la relation de contact existe déjà et son statut
//         const existingContact = await Contact.findOne({ where: { ID_User, ID_Contact_User } });
//         if (existingContact && ['Ami', 'En attente', 'Bloqué'].includes(existingContact.Statut)) {
//             return res.status(400).json({ success: false, message: 'Le contact existe déjà avec un statut spécifié.' });
//         }

//         const newContact = await Contact.create({ ID_User, ID_Contact_User, Statut: 'En attente' });

//         // Utiliser les WebSockets pour notifier l'utilisateur contacté
//         socketController.notifyContactRequest(ID_Contact_User, newContact);

//         res.status(201).json({ success: true, message: 'Demande de contact envoyée.', contact: newContact });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Supprimer un contact

exports.addContact = async (req, res) => {
  try {
    // Récupération de l'ID de l'utilisateur depuis le JWT 
    const ID_User = req.user.userId; 

    // Récupération de l'ID de l'utilisateur à ajouter comme contact depuis le corps de la requête
    const { ID_Contact_User } = req.body;
    console.log(req.body);

    // Vérifier si l'utilisateur tente de s'ajouter lui-même
    if (ID_User === ID_Contact_User) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Impossible de s'ajouter soi-même en tant que contact.",
        });
    }

    // Vérifier si une relation de contact existe déjà dans les deux sens
    const existingContact = await Contact.findOne({
      where: {
        [Op.or]: [
          { ID_User, ID_Contact_User },
          { ID_User: ID_Contact_User, ID_Contact_User: ID_User },
        ],
      },
    });

    if (existingContact) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Une relation de contact existe déjà.",
        });
    }

    // Créer un nouveau contact avec le statut 'En attente'
    const newContact = await Contact.create({
      ID_User,
      ID_Contact_User,
      Statut: "En attente",
    });
    ///////////////////////////////////////////////////////////////////////////////
    // Todo 
    // Utiliser les WebSockets pour notifier l'utilisateur contacté
    // socketController.notifyContactRequest(ID_Contact_User, newContact);
    ///////////////////////////////////////////////////////////////////////////////
    res
      .status(201)
      .json({
        success: true,
        message: "Demande de contact envoyée.",
        contact: newContact,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports.removeContact = async (req, res) => {
//     try {
//         // Récupération de l'ID de l'utilisateur à supprimer depuis le corps de la requête
//         const { ID_Contact_User } = req.body;

//         // Récupération de l'ID de l'utilisateur connecté depuis le JWT ou la session
//         const ID_User = req.user.userId; // Assurez-vous que cette propriété correspond à votre implémentation

//         // Chercher le contact spécifique entre l'utilisateur connecté et l'utilisateur à supprimer
//         const contact = await Contact.findOne({
//             where: {
//                 ID_User: ID_User,
//                 ID_Contact_User: ID_Contact_User
//             }
//         });

//         if (!contact) {
//             return res.status(404).json({ success: false, message: 'Contact non trouvé.' });
//         }

//         // Assurer que le statut permet la suppression ('En attente' est supprimable)
//         if (['Bloqué'].includes(contact.Statut)) {
//             return res.status(400).json({ success: false, message: 'Le statut du contact ne permet pas la suppression.' });
//         }

//         // Supprimer le contact
//         await Contact.destroy({
//             where: {
//                 ID_User: ID_User,
//                 ID_Contact_User: ID_Contact_User
//             }
//         });

//         res.status(200).json({ success: true, message: 'Contact supprimé avec succès.' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.removeContact = async (req, res) => {
  try {
    const { ID_Contact_User } = req.body;
    const ID_User = req.user.userId;
    const contact = await Contact.findOne({
      where: {
        ID_User: ID_User,
        ID_Contact_User: ID_Contact_User,
      },
    });
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact non trouvé." });
    }
    // Si le contact est bloqué, s'assurer que c'est l'utilisateur actuel qui a initié le blocage
    if (contact.Statut === "Bloqué" && contact.ID_User !== ID_User) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Seul l'utilisateur ayant initié le blocage peut supprimer ce contact.",
        });
    }

    await Contact.destroy({
      where: {
        ID_User: ID_User,
        ID_Contact_User: ID_Contact_User,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "Contact supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const ID_User = req.user.userId; // Récupérer l'ID de l'utilisateur connecté

    const contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { ID_User: ID_User, Statut: "Ami" },
          { ID_Contact_User: ID_User, Statut: "Ami" },
        ],
      },
      include: [
        {
          model: Utilisateur,
          as: "UtilisateurPrincipal",
          where: { isDeleted: 0 }, // Ne pas inclure les utilisateurs supprimés
          attributes: [
            "ID_User",
            "Nom",
            "Prenom",
            "Email",
            "Statut",
            "Image_de_profil",
          ],
        },
        {
          model: Utilisateur,
          as: "UtilisateurContact",
          where: { isDeleted: 0 },
          attributes: [
            "ID_User",
            "Nom",
            "Prenom",
            "Email",
            "Statut",
            "Image_de_profil",
          ],
        },
      ],
      attributes: ["ID_Contact", "ID_User", "ID_Contact_User", "Statut"],
    });

    // Transformer les contacts pour inclure les informations correctes de l'ami
    const transformedContacts = contacts.map((contact) => {
      const contactInfo =
        contact.ID_User === ID_User
          ? contact.UtilisateurContact
          : contact.UtilisateurPrincipal;
      return {
        ID_Contact: contact.ID_Contact,
        ID_User: contact.ID_User,
        ID_Contact_User: contact.ID_Contact_User,
        Statut: contact.Statut,
        Ami: contactInfo, // Informations de l'ami
      };
    });

    res.status(200).json({ success: true, contacts: transformedContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactblock = async (req, res) => {
  // Récupérer les contacts bloqués
  try {
    const ID_User = req.user.userId; // Récupérer l'ID de l'utilisateur connecté
    const contacts = await Contact.findAll({
      where: { ID_User, Statut: "Bloqué" },
      include: [
        {
          model: Utilisateur,
          as: "UtilisateurContact",
          attributes: [
            "ID_User",
            "Nom",
            "Prenom",
            "Email",
            "Statut",
            "Image_de_profil",
          ], // Champs à inclure
        },
      ],
      attributes: ["ID_Contact", "ID_User", "ID_Contact_User", "Statut"], // Champs à inclure pour Contact
    });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const ID_User = req.user.userId;

    // Obtenir les ID des utilisateurs qui sont 'Amis' ou 'Bloqués' avec l'utilisateur connecté, dans les deux sens
    const relatedUsers = await Contact.findAll({
      where: {
        [Op.or]: [{ ID_User: ID_User }, { ID_Contact_User: ID_User }],
        Statut: { [Op.in]: ["Ami", "Bloqué"] },
      },
      attributes: ["ID_User", "ID_Contact_User"],
    });

    // Extraire les ID des utilisateurs à exclure
    const excludeIDs = relatedUsers.reduce((ids, relation) => {
      ids.add(relation.ID_User);
      ids.add(relation.ID_Contact_User);
      return ids;
    }, new Set([ID_User])); // Inclure l'utilisateur lui-même dans la liste d'exclusion

    // Trouver tous les utilisateurs sauf l'utilisateur connecté, ses amis et les bloqués
    const users = await Utilisateur.findAll({
      where: {
        ID_User: { [Op.notIn]: Array.from(excludeIDs) },
        isDeleted: false,
      },
      attributes: [
        "ID_User",
        "Nom",
        "Prenom",
        "Email",
        "Statut",
        "Image_de_profil",
      ],
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { ID_Contact_User } = req.body;
    const ID_User = req.user.userId;

    // Rechercher le contact où l'utilisateur connecté est l'initiateur
    let contact = await Contact.findOne({
      where: {
        ID_User: ID_User,
        ID_Contact_User: ID_Contact_User,
      },
    });

    if (!contact) {
      // Si aucun contact n'existe où l'utilisateur connecté est l'initiateur, vérifier si l'autre utilisateur l'a bloqué
      contact = await Contact.findOne({
        where: {
          ID_User: ID_Contact_User,
          ID_Contact_User: ID_User,
        },
      });

      if (!contact) {
        // Si aucun contact n'existe dans les deux sens, créer un nouveau contact avec le statut 'Bloqué'
        contact = await Contact.create({
          ID_User: ID_User,
          ID_Contact_User: ID_Contact_User,
          Statut: "Bloqué",
        });
      } else if (contact.Statut !== "Bloqué") {
        // Si l'autre utilisateur ne l'a pas déjà bloqué, mettre à jour le statut en 'Bloqué'
        await Contact.update(
          { Statut: "Bloqué" },
          {
            where: {
              ID_User: ID_Contact_User,
              ID_Contact_User: ID_User,
            },
          }
        );
      }
    } else {
      // Si le contact existe où l'utilisateur connecté est l'initiateur, mettre à jour le statut en 'Bloqué'
      await Contact.update(
        { Statut: "Bloqué" },
        {
          where: {
            ID_User: ID_User,
            ID_Contact_User: ID_Contact_User,
          },
        }
      );
    }

    // Utiliser les WebSockets pour notifier les utilisateurs concernés
    // socketController.notifyContactStatusChange(ID_Contact_User, 'Bloqué');

    res
      .status(200)
      .json({ success: true, message: "Contact bloqué avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingContactRequests = async (req, res) => {
  try {
    const ID_User = req.user.userId;

    // Rechercher toutes les demandes de contact en attente adressées à l'utilisateur connecté
    const pendingRequests = await Contact.findAll({
      where: {
        ID_Contact_User: ID_User, // L'utilisateur connecté est celui qui a reçu la demande
        Statut: "En attente",
      },
      include: [
        {
          model: Utilisateur,
          as: "UtilisateurPrincipal", // Utilisateur qui a envoyé la demande
          attributes: ["ID_User", "Nom", "Prenom", "Email"], // Informations de l'utilisateur demandeur
        },
      ],
    });

    res.status(200).json({ success: true, pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// accepter une demande d'amitié
exports.approuveContactRequest = async (req, res) => {
  try {
    const { ID_Contact_User } = req.body;
    const ID_User = req.user.userId;

    const contact = await Contact.findOne({
      where: {
        ID_User: ID_Contact_User,
        ID_Contact_User: ID_User,
      },
    });

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Demande de contact non trouvée." });
    }

    // Mettre à jour le statut en 'Ami'
    await Contact.update(
      { Statut: "Ami" },
      {
        where: {
          ID_User: ID_Contact_User,
          ID_Contact_User: ID_User,
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Demande de contact acceptée." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// creation d'un groupe de discussion

exports.createGroup = async (req, res) => {
  try {
    const { Nom, Description, Membres } = req.body;
    const ID_User = req.user.userId; // ID extrait du token JWT

    // Pas besoin de vérifier si ID_User est dans Membres, car le créateur est toujours l'utilisateur authentifié

    for (const membre of Membres) {
      if (membre === ID_User) continue; // Ignorer la vérification d'amitié pour le créateur

      const isFriend = await Contact.findOne({
        where: {
          [Op.or]: [
            { ID_User, ID_Contact_User: membre, Statut: "Ami" },
            { ID_User: membre, ID_Contact_User: ID_User, Statut: "Ami" },
          ],
        },
      });

      const isNotDeleted = await Utilisateur.findOne({
        where: { ID_User: membre, isDeleted: 0 },
      });

      if (!isFriend || !isNotDeleted) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Tous les membres doivent être des amis non supprimés.",
          });
      }
    }

    const group = await Groupe.create({
      Nom_du_groupe: Nom,
      Description_du_groupe: Description,
      ID_Admin: ID_User,
    });

    const memberRoles = Membres.map((membre) => ({
      ID_Groupe: group.ID_Groupe,
      ID_User: membre,
      Rôle: "Membre", // Tous les autres sont des membres
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Ajouter séparément le créateur en tant qu'Admin
    memberRoles.push({
      ID_Groupe: group.ID_Groupe,
      ID_User: ID_User,
      Rôle: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(memberRoles);
    await MembreGroupe.bulkCreate(memberRoles);

    res
      .status(201)
      .json({ success: true, message: "Groupe créé avec succès.", group });
  } catch (error) {
    console.error("Erreur lors de la création du groupe:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour un groupe
exports.updateGroup = async (req, res) => {
  try {
    const {
      ID_Groupe,
      NouveauNom,
      NouvelleDescription,
      MembresAAjouter,
      MembresARetirer,
      NouveauxAdmins,
    } = req.body;
    const ID_User = req.user.userId; // ID de l'utilisateur authentifié

    // Récupérer le groupe existant
    const groupe = await Groupe.findOne({ where: { ID_Groupe } });

    // Vérifier si le groupe existe
    if (!groupe) {
      return res
        .status(404)
        .json({ success: false, message: "Groupe introuvable." });
    }

    // Vérifier si l'utilisateur est l'administrateur du groupe
    if (groupe.ID_Admin !== ID_User) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Seul l'administrateur peut modifier le groupe.",
        });
    }

    // Mettre à jour le nom et/ou la description du groupe si nécessaire
    if (NouveauNom || NouvelleDescription) {
      if (NouveauNom) groupe.Nom_du_groupe = NouveauNom;
      if (NouvelleDescription)
        groupe.Description_du_groupe = NouvelleDescription;
      await groupe.save();
    }

    // Ajouter de nouveaux membres
    if (MembresAAjouter && MembresAAjouter.length > 0) {
      const nouveauxMembres = MembresAAjouter.map((membre) => ({
        ID_Groupe,
        ID_User: membre,
        Rôle: "Membre",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await MembreGroupe.bulkCreate(nouveauxMembres);
    }

    // Retirer des membres
    if (MembresARetirer && MembresARetirer.length > 0) {
      await MembreGroupe.destroy({
        where: {
          ID_Groupe,
          ID_User: { [Op.in]: MembresARetirer },
        },
      });
    }

    // Promouvoir de nouveaux administrateurs
    if (NouveauxAdmins && NouveauxAdmins.length > 0) {
      await MembreGroupe.update(
        { Rôle: "Admin" },
        {
          where: {
            ID_Groupe,
            ID_User: { [Op.in]: NouveauxAdmins },
          },
        }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Groupe mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du groupe:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer les membres d'un groupe
exports.getGroupMembers = async (req, res) => {
    try {
        const { ID_Groupe } = req.body; // Récupérer l'ID du groupe depuis le corps de la requête
        const ID_User = req.user.userId; // ID de l'utilisateur authentifié
    
        // Vérifier si l'utilisateur appartient au groupe
        const isMember = await MembreGroupe.findOne({
            where: { ID_Groupe, ID_User },
        });
    
        if (!isMember) {
            return res
                .status(403)
                .json({ success: false, message: "Vous n'êtes pas membre du groupe." });
        }
    
        // Récupérer les membres du groupe et leurs rôles
        const membres = await MembreGroupe.findAll({
            where: { ID_Groupe },
            include: [{
                model: Utilisateur,
                as: "Utilisateur",
                attributes: ["ID_User", "Nom", "Prenom", "Statut", "Image_de_profil"],
            }],
            attributes: ['Rôle'] // Inclure le rôle de chaque membre
        });
    
        res.status(200).json({ success: true, membres });
    } catch (error) {
        console.error("Erreur lors de la récupération des membres du groupe:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Supprimer un groupe

exports.deleteGroup = async (req, res) => {
    try {
      const { ID_Groupe } = req.body; // Récupérer l'ID du groupe depuis le corps de la requête
      const ID_User = req.user.userId; // ID de l'utilisateur authentifié
  
      // Vérifier si l'utilisateur est l'administrateur du groupe
      const membre = await MembreGroupe.findOne({
        where: { ID_Groupe, ID_User }
      });
  
      if (!membre) {
        return res
          .status(404)
          .json({ success: false, message: "Membre du groupe introuvable." });
      }
  
      if (membre.Rôle !== 'Admin') {
        return res
          .status(403)
          .json({
            success: false,
            message: "Seul l'administrateur peut supprimer le groupe.",
          });
      }
  
      // Supprimer le groupe et toutes les associations
      await MembreGroupe.destroy({ where: { ID_Groupe } });
      await Groupe.destroy({ where: { ID_Groupe } });
  
      res
        .status(200)
        .json({ success: true, message: "Groupe supprimé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression du groupe:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
// Récupérer les groupes d'un utilisateur
  exports.getUserGroups = async (req, res) => {
    try {
        const ID_User = req.user.userId; // ID de l'utilisateur connecté

        // Trouver tous les enregistrements de MembreGroupe où l'utilisateur est membre ou admin
        const memberships = await MembreGroupe.findAll({
            where: { ID_User },
            include: [{
                model: Groupe, // Assurez-vous que ce modèle est bien configuré
                required: true
            }]
        });

        // Préparer les données des groupes avec le rôle de l'utilisateur
        const groupes = memberships.map(({ Groupe, Rôle }) => ({
            ...Groupe.get({ plain: true }), // Obtient les données du groupe
            RoleUtilisateur: Rôle // Rôle de l'utilisateur dans le groupe
        }));

        res.status(200).json({ success: true, groupes });
    } catch (error) {
        console.error("Erreur lors de la récupération des groupes de l'utilisateur:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = exports;
