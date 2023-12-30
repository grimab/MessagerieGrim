

// const { Conversation, Contact, Utilisateur } = require('../../models'); // Assurez-vous que le chemin est correct
const { Conversation , Contact , Utilisateur, Message } = require('../../models'); // Assurez-vous que le chemin est correct
const Op = require('sequelize').Op;
// const sequelize = require('sequelize');
const sequelize = require('../../models/index.js');



// Créer une conversation entre deux utilisateurs
exports.createConversation = async (req, res) => {
    try {
        // Utilisateur qui fait la demande (ID_User1) reçu du token
        const ID_User1 = req.user.userId;
        //Utilisateur avec qui on veut créer la conversation (ID_User2) reçu du body
        const { ID_User2 } = req.body;



        // Validation de l'entrée
        if (!ID_User2) {
            return res.status(400).json({ success: false, message: "ID_User2 est requis." });
        }

        if (ID_User1 === ID_User2) {
            return res.status(400).json({ success: false, message: "Impossible de créer une conversation avec soi-même." });
        }

        // Vérification de l'existence de l'utilisateur
        const user = await Utilisateur.findByPk(ID_User2);
        if (!user) {
            
            return res.status(404).json({ success: false, message: "L'utilisateur n'existe pas." });
        }

        // Vérification du statut d'ami
        const areFriends = await Contact.count({
            where: {
                [Op.or]: [
                    { ID_User: ID_User1, ID_Contact_User: ID_User2, Statut: 'Ami' },
                    { ID_User: ID_User2, ID_Contact_User: ID_User1, Statut: 'Ami' }
                ]
            }
        });

        console.log('areFriends', areFriends);
        if (areFriends === 0) {
            return res.status(400).json({ success: false, message: 'Les utilisateurs doivent être amis pour créer une conversation.' });
        }

// Vérification de l'existence d'une conversation entre les deux utilisateurs
const conversation = await Conversation.findOne({
    where: {
        [Op.or]: [
            { ID_User1: ID_User1, ID_User2: ID_User2 },
            { ID_User1: ID_User2, ID_User2: ID_User1 }
        ]
    },
    attributes: ['ID_Conversation', 'ID_User1', 'ID_User2', 'Confidentialite', 'Dernier_message', 'createdAt', 'updatedAt']
    // Spécifiez ici les attributs que vous voulez sélectionner
});

if (conversation) {
    return res.status(400).json({ success: false, message: 'Une conversation existe déjà entre ces deux utilisateurs.' });
}


        // Création de la conversation
        const newConversation = await Conversation.create({ ID_User1, ID_User2 });
        res.status(201).json({ success: true, conversation: newConversation });
    } catch (error) {
        // Gestion d'erreur plus détaillée
        
        res.status(500).json({ success: false, message: `Erreur lors de la création de la conversation : ${error.message}` });
    }
};



// recuperer les conversations d'un utilisateur connecté
exports.getConversations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const userID = req.user.userId; // Assurez-vous que l'utilisateur est authentifié

        // Récupérer les conversations de l'utilisateur
        const conversations = await Conversation.findAndCountAll({
            where: {
                [Op.or]: [
                    { ID_User1: userID },
                    { ID_User2: userID }
                ]
            },
            include: [
                {
                    model: Utilisateur, // Assurez-vous que le modèle Utilisateur est importé correctement
                    as: 'Utilisateur1',
                    attributes: ['Nom', 'Prenom'],
                },
                {
                    model: Utilisateur,
                    as: 'Utilisateur2',
                    attributes: ['Nom', 'Prenom'],
                }
            ],
            limit: limit,
            offset: offset,
            attributes: ['ID_Conversation', 'ID_User1', 'ID_User2', 'Confidentialite', 'Dernier_message', 'createdAt', 'updatedAt']
        });

        res.status(200).json({ success: true, data: conversations.rows, total: conversations.count, page: page, totalPages: Math.ceil(conversations.count / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Supprimer une conversation
exports.deleteConversation = async (req, res) => {
    try {
        const ID_User = req.user.userId; // Utilisateur qui fait la demande
        // console.log(ID_User);
        const { ID_Conversation } = req.body;

        const conversation = await Conversation.findByPk(ID_Conversation, {
            attributes: ['ID_Conversation', 'ID_User1', 'ID_User2', 'Confidentialite', 'Dernier_message', 'createdAt', 'updatedAt']
        });
        
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation non trouvée.' });
        }

        // Vérifier si l'utilisateur est un participant de la conversation ou un administrateur
        if (conversation.ID_User1 !== ID_User && conversation.ID_User2 !== ID_User && req.user.roleId !== 2205) {
            return res.status(403).json({ success: false, message: 'Action non autorisée.' });
        }

        // Supprimer la conversation
        await Conversation.destroy({ where: { ID_Conversation } });

        res.status(200).json({ success: true, message: 'Conversation supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// supprimer une conversation ou le champs confidentiel est true ( si c'est true elle est suprimer au bout de 12h apres sa derniere modification)

// exports.deleteConversationConfidentiel = async (req, res) => {
//     try {
//         const ID_User = req.user.userId; // Utilisateur qui fait la demande
//         // console.log(ID_User);
//         const { ID_Conversation } = req.body;

//         const conversation = await Conversation.findByPk(ID_Conversation);

//         if (!conversation) {
//             return res.status(404).json({ success: false, message: 'Conversation non trouvée.' });
//         }

//         // Vérifier si l'utilisateur est un participant de la conversation ou un administrateur
//         if (conversation.ID_User1 !== ID_User && conversation.ID_User2 !== ID_User && req.user.roleId !== 2205) {
//             return res.status(403).json({ success: false, message: 'Action non autorisée.' });
//         }
//         //si le champs confidentiel est true et que la date de modification est superieur a 12h
//         if (conversation.confidentiel === true && conversation.updatedAt < Date.now() - 43200000) {
//             // Supprimer la conversation
//             await Conversation.destroy({ where: { ID_Conversation } });
//             return res.status(200).json({ success: true, message: 'Conversation supprimée avec succès.' });
//         }

//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }





module.exports = exports;



