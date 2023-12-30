//contactController.js


const { Contact, Utilisateur } = require('../../models'); // Vérifiez les chemins d'accès
const socketController = require('../sockets/socketController'); // Importez le contrôleur de socket si nécessaire
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
        // Récupération de l'ID de l'utilisateur depuis le JWT (présumé ajouté par le middleware d'authentification)
        const ID_User = req.user.userId; // Assurez-vous que cette propriété correspond à votre implémentation

        // Récupération de l'ID de l'utilisateur à ajouter comme contact depuis le corps de la requête
        const { ID_Contact_User } = req.body;
        console.log(req.body);

                // Vérifier si l'utilisateur tente de s'ajouter lui-même
                if (ID_User === ID_Contact_User) {
                    return res.status(400).json({ success: false, message: "Impossible de s'ajouter soi-même en tant que contact." });
                }
                
        // Vérifier si une relation de contact existe déjà dans les deux sens
        const existingContact = await Contact.findOne({ 
            where: {
                [Op.or]: [
                    { ID_User, ID_Contact_User },
                    { ID_User: ID_Contact_User, ID_Contact_User: ID_User }
                ]
            }
        });

        if (existingContact) {
            return res.status(400).json({ success: false, message: 'Une relation de contact existe déjà.' });
        }

        // Créer un nouveau contact avec le statut 'En attente'
        const newContact = await Contact.create({ ID_User, ID_Contact_User, Statut: 'En attente' });
///////////////////////////////////////////////////////////////////////////////
        // Utiliser les WebSockets pour notifier l'utilisateur contacté
        // socketController.notifyContactRequest(ID_Contact_User, newContact);
///////////////////////////////////////////////////////////////////////////////
        res.status(201).json({ success: true, message: 'Demande de contact envoyée.', contact: newContact });
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
                ID_Contact_User: ID_Contact_User 
            } 
        });

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact non trouvé.' });
        }

        // Si le contact est bloqué, s'assurer que c'est l'utilisateur actuel qui a initié le blocage
        if (contact.Statut === 'Bloqué' && contact.ID_User !== ID_User) {
            return res.status(403).json({ success: false, message: 'Seul l\'utilisateur ayant initié le blocage peut supprimer ce contact.' });
        }

        await Contact.destroy({ 
            where: { 
                ID_User: ID_User, 
                ID_Contact_User: ID_Contact_User 
            } 
        });

        res.status(200).json({ success: true, message: 'Contact supprimé avec succès.' });
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
                    { ID_User: ID_User, Statut: 'Ami' },
                    { ID_Contact_User: ID_User, Statut: 'Ami' }
                ]
            },
            include: [{
                model: Utilisateur,
                as: 'UtilisateurPrincipal',
                attributes: ['ID_User', 'Nom', 'Prenom', 'Email', 'Statut', 'Image_de_profil']
            }, {
                model: Utilisateur,
                as: 'UtilisateurContact',
                attributes: ['ID_User', 'Nom', 'Prenom', 'Email', 'Statut', 'Image_de_profil']
            }],
            attributes: ['ID_Contact', 'ID_User', 'ID_Contact_User', 'Statut']
        });

        // Transformer les contacts pour inclure les informations correctes de l'ami
        const transformedContacts = contacts.map(contact => {
            const contactInfo = contact.ID_User === ID_User ? contact.UtilisateurContact : contact.UtilisateurPrincipal;
            return {
                ID_Contact: contact.ID_Contact,
                ID_User: contact.ID_User,
                ID_Contact_User: contact.ID_Contact_User,
                Statut: contact.Statut,
                Ami: contactInfo // Informations de l'ami
            };
        });

        res.status(200).json({ success: true, contacts: transformedContacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getContactblock = async (req, res) => { // Récupérer les contacts bloqués
    try {
        const ID_User = req.user.userId; // Récupérer l'ID de l'utilisateur connecté
        const contacts = await Contact.findAll({
            where: { ID_User, Statut: 'Bloqué' },
            include: [{
                model: Utilisateur,
                as: 'UtilisateurContact',
                attributes: ['ID_User', 'Nom', 'Prenom', 'Email', 'Statut', 'Image_de_profil'] // Champs à inclure
            }],
            attributes: ['ID_Contact', 'ID_User', 'ID_Contact_User', 'Statut'] // Champs à inclure pour Contact
        });
        res.status(200).json({ success: true, contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




// Fonction pour lister tous les utilisateurs sauf l'utilisateur connecté et ses amis



exports.getAllUsers = async (req, res) => {
    try {
        const ID_User = req.user.userId;

        // Obtenir les ID des utilisateurs qui sont 'Amis' ou 'Bloqués' avec l'utilisateur connecté, dans les deux sens
        const relatedUsers = await Contact.findAll({
            where: {
                [Op.or]: [
                    { ID_User: ID_User },
                    { ID_Contact_User: ID_User }
                ],
                Statut: { [Op.in]: ['Ami', 'Bloqué'] }
            },
            attributes: ['ID_User', 'ID_Contact_User']
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
                isDeleted: false
            },
            attributes: ['ID_User', 'Nom', 'Prenom', 'Email', 'Statut', 'Image_de_profil']
        });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// exports.updateContactStatus = async (req, res) => {
//     try {
//         const { ID_Contact_User } = req.body;
//         const ID_User = req.user.userId;

//         let contact = await Contact.findOne({
//             where: { 
//                 ID_User: ID_User, 
//                 ID_Contact_User: ID_Contact_User 
//             }
//         });

//         if (!contact) {
//             // Créer un nouveau contact avec le statut 'Bloqué'
//             contact = await Contact.create({
//                 ID_User: ID_User,
//                 ID_Contact_User: ID_Contact_User,
//                 Statut: 'Bloqué'
//             });
//         } else {
//             // Mettre à jour le statut en 'Bloqué'
//             await Contact.update({ Statut: 'Bloqué' }, {
//                 where: { 
//                     ID_User: ID_User, 
//                     ID_Contact_User: ID_Contact_User 
//                 }
//             });
//         }
// ///////////////////////////////////////////////////////////////////////////////
//         // Utiliser les WebSockets pour notifier les utilisateurs concernés
//       //  socketController.notifyContactStatusChange(ID_Contact_User, 'Bloqué');
// ///////////////////////////////////////////////////////////////////////////////
//         res.status(200).json({ success: true, message: 'Contact bloqué avec succès.' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Lister toutes les demandes de contact en attente adressées à l'utilisateur connecté
// exports.getPendingContactRequests = async (req, res) => {
//     try {
//         const ID_User = req.user.userId;

//         // Rechercher toutes les demandes de contact en attente adressées à l'utilisateur connecté
//         const pendingRequests = await Contact.findAll({
//             where: { 
//                 ID_Contact_User: ID_User, 
//                 Statut: 'En attente' 
//             },
//             include: [{
//                 model: Utilisateur,
//                 as: 'UtilisateurPrincipal',
//                 attributes: ['ID_User', 'Nom', 'Prenom', 'Email'] // Informations de l'utilisateur demandeur
//             }]
//         });

//         res.status(200).json({ success: true, pendingRequests });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.updateContactStatus = async (req, res) => {
    try {
        const { ID_Contact_User } = req.body;
        const ID_User = req.user.userId;

        // Rechercher le contact où l'utilisateur connecté est l'initiateur
        let contact = await Contact.findOne({
            where: { 
                ID_User: ID_User, 
                ID_Contact_User: ID_Contact_User 
            }
        });

        if (!contact) {
            // Si aucun contact n'existe où l'utilisateur connecté est l'initiateur, vérifier si l'autre utilisateur l'a bloqué
            contact = await Contact.findOne({
                where: { 
                    ID_User: ID_Contact_User, 
                    ID_Contact_User: ID_User 
                }
            });

            if (!contact) {
                // Si aucun contact n'existe dans les deux sens, créer un nouveau contact avec le statut 'Bloqué'
                contact = await Contact.create({
                    ID_User: ID_User,
                    ID_Contact_User: ID_Contact_User,
                    Statut: 'Bloqué'
                });
            } else if (contact.Statut !== 'Bloqué') {
                // Si l'autre utilisateur ne l'a pas déjà bloqué, mettre à jour le statut en 'Bloqué'
                await Contact.update({ Statut: 'Bloqué' }, {
                    where: { 
                        ID_User: ID_Contact_User, 
                        ID_Contact_User: ID_User 
                    }
                });
            }
        } else {
            // Si le contact existe où l'utilisateur connecté est l'initiateur, mettre à jour le statut en 'Bloqué'
            await Contact.update({ Statut: 'Bloqué' }, {
                where: { 
                    ID_User: ID_User, 
                    ID_Contact_User: ID_Contact_User 
                }
            });
        }

        // Utiliser les WebSockets pour notifier les utilisateurs concernés
        // socketController.notifyContactStatusChange(ID_Contact_User, 'Bloqué');

        res.status(200).json({ success: true, message: 'Contact bloqué avec succès.' });
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
                Statut: 'En attente' 
            },
            include: [{
                model: Utilisateur,
                as: 'UtilisateurPrincipal', // Utilisateur qui a envoyé la demande
                attributes: ['ID_User', 'Nom', 'Prenom', 'Email'] // Informations de l'utilisateur demandeur
            }]
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
                ID_Contact_User: ID_User 
            }
        });

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Demande de contact non trouvée.' });
        }

        // Mettre à jour le statut en 'Ami'
        await Contact.update({ Statut: 'Ami' }, {
            where: { 
                ID_User: ID_Contact_User, 
                ID_Contact_User: ID_User 
            }
        });

        res.status(200).json({ success: true, message: 'Demande de contact acceptée.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
   

module.exports =exports;
