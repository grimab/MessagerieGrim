// userController.js

const bcrypt = require('bcrypt');
const { Utilisateur } = require('../../models');
const errorMiddleware = require('../middlewares/errorMiddleware');
const { SecuriteUtilisateur } = require('../../models');
const { sequelize } = require('../../models');
const { Groupe, MembreGroupe,HistoriqueChangementMotDePasse,PieceJointe,ID_User} = require('../../models');
const { v4: uuidv4 } = require('uuid');
const { storeToken } = require('../sockets/webSocketTokenStore');

const jwt = require('jsonwebtoken');

const SECRET_KEY = "maSuperCleSecrete"; 

exports.register = async (req, res,next) => {
    try {
        console.log("Requête reçue:", req.body);
        const hashedPassword = await bcrypt.hash(req.body.hashedPassword, 12);// 12 est le nombre de tours de l'algorithme de hachage cella permet de rendre le hachage plus lent mais plus sécurisé ce qui rend plus difficile le brute force 
        const user = await Utilisateur.create({ 
            Nom: req.body.Nom,
            Prenom: req.body.Prenom,
            Email: req.body.Email,
            hashedPassword,
            //Date_de_creation: new Date(), // new Date() retourne la date du jour
            Date_de_derniere_connexion: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
                   
        });
// console.log("Utilisateur créé:", user);
        const token = jwt.sign({ userId: user.ID_User, roleId: user.RoleID }, SECRET_KEY, {
            expiresIn: '24h'  // le jeton expirera après 24 heures
        });
        // res.status(201).json({ success: true, message: "Inscription réussie ! Bienvenue.",  token: token });

  

  

    res.cookie('auth_token', token, {
        httpOnly: true,    // Le cookie ne peut pas être accédé par des scripts côté client
        secure: true,      // Le cookie ne sera envoyé que sur des connexions HTTPS
        maxAge: 24 * 60 * 60 * 1000,    // Durée de vie du cookie en millisecondes (24 heures ici)
        sameSite: 'none'   // Si vous travaillez en cross-domain, vous pourriez avoir besoin de cette option. Sinon, vous pouvez la supprimer.
    });
    
    res.status(201).json({ success: true, message: "Inscription réussie ! Bienvenue." });
    


    }  

    catch (error) {
        console.error("Erreur lors de l'inscription:", error); 
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { Email, hashedPassword } = req.body;

        const user = await Utilisateur.findOne({ 
            where: { 
                Email: req.body.Email,
                isDeleted: false  // S'assurer que l'utilisateur n'est pas marqué comme supprimé
            } 
        });

        if (!user) {
            return next(new Error('Email ou mot de passe incorrect'));
        }

        const isMatch = await bcrypt.compare(hashedPassword, user.hashedPassword);
        if (!isMatch) {
            return next(new Error('Email ou mot de passe incorrect'));
        }

        // Création du token JWT
        const token = jwt.sign({ userId: user.ID_User ,roleId: user.RoleID}, SECRET_KEY, { expiresIn: '24h' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'
        });

        // Générer un token unique pour WebSocket
        const webSocketToken = uuidv4();
        storeToken(user.ID_User, webSocketToken);

        // Mise à jour de la date de dernière connexion
        await Utilisateur.update(
            { Date_de_derniere_connexion: new Date(), Statut: 'En ligne' },
            { where: { ID_User: user.ID_User } }
        );

        res.status(200).json({ success: true, message: "connexion réussie ! Bienvenue.", webSocketToken });
        // res.status(200).json({ success: true, message: "connexion réussie ! Bienvenue."});
    } catch (error) {
        next(error);
    }
};

// exports.setStatus = async (req, res, next) => {
//     const userId = req.user.userId;
//     const { status } = req.body; // 'En ligne', 'Hors ligne', 'Ne pas déranger', 'Invisible'

//     try {
//         await Utilisateur.update({ Statut: status }, { where: { ID_User: userId } });
//         res.status(200).json({ message: "Statut mis à jour avec succès." });
//     } catch (error) {
//         next(error);
//     }
// };
exports.setStatus = async (req, res, next) => {
    // Récupérer l'ID de l'utilisateur à partir du JWT
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.roleId; 

    // Récupérer les données de la requête
    const { status, userId } = req.body; // Ajouter un champ userId pour permettre à l'admin de spécifier quel utilisateur modifier

    try {
        // Déterminer l'ID de l'utilisateur dont le statut doit être mis à jour
        let targetUserId = requestingUserId; // Par défaut, c'est l'utilisateur qui fait la requête
        if (requestingUserRole === 2205 && userId) { // Vérifier si l'utilisateur est un admin et si un userId est fourni
            targetUserId = userId; // Permettre à l'admin de mettre à jour le statut d'un autre utilisateur
        }

        // Mettre à jour le statut
        await Utilisateur.update({ Statut: status }, { where: { ID_User: targetUserId } });

        res.status(200).json({ message: "Statut mis à jour avec succès." });
    } catch (error) {
        next(error);
    }
};

// exports.updateUser = async (req, res, next) => {
//     try {

//         const userId = req.user.userId;

//         const user = await Utilisateur.findOne({ where: { ID_User: userId, isDeleted: false } });
//         if (!user) {
//             return res.status(404).json({ message: "Utilisateur non trouvé ou supprimé." });
//         }

        
//         // Vérifiez si le mot de passe actuel est correct
//         const isMatch = await bcrypt.compare(req.body.currentPassword, user.hashedPassword);
//         if (!isMatch) {
//             return next(new Error('Mot de passe actuel incorrect'));
//         }

//         const updatedFields = {
//             Nom: req.body.Nom,
//             Prenom: req.body.Prenom,
//             hashedPassword: req.body.hashedPassword ? await bcrypt.hash(req.body.hashedPassword, 12) : undefined
//         };

//         // Supprimez les champs non fournis (non mis à jour) de l'objet
//         Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);

//         const updatedUser = await Utilisateur.update(updatedFields, {
//             where: { ID_User: userId }
//         });

//         if (!updatedUser) {
//             return next(new Error('La mise à jour a échoué'));
//         }

//         res.status(200).json({ success: true, message: 'Informations mises à jour avec succès.' });

//         // si des champs ont été mis à jour, mettre a jour le champs updatedat de la table utilisateur
//         if (Object.keys(updatedFields).length > 0) {
//             await Utilisateur.update({ updatedAt: new Date() }, {
//                 where: { ID_User: userId }
//             });
//         }

//     } catch (error) {
//         next(error);
//     }
// };
exports.updateUser = async (req, res, next) => {
    try {
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.roleId; // Assurez-vous que le roleId est inclus dans le JWT

        let targetUserId = requestingUserId;
        if (requestingUserRole === 2205 && req.body.userId) { // Si l'admin met à jour un autre utilisateur
            targetUserId = req.body.userId;
        }

        const user = await Utilisateur.findOne({ where: { ID_User: targetUserId, isDeleted: false } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou supprimé." });
        }

        if (requestingUserRole !== 2205) {

    if (!req.body.currentPassword || !user.hashedPassword) {
    return res.status(400).json({ message: "Mot de passe actuel manquant ou pas de mot de passe haché enregistré." });
  }
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.hashedPassword);
            if (!isMatch) {
                return next(new Error('Mot de passe actuel incorrect'));
            }
        }

        const updatedFields = {
            Nom: req.body.Nom,
            Prenom: req.body.Prenom
        };

        if (requestingUserRole === 2205) {
            // Permettre à l'admin de changer le rôle de l'utilisateur
            if (req.body.roleId) {
                updatedFields.roleId = req.body.roleId;
            }

            // Permettre à l'admin de mettre à jour le mot de passe sans vérification
            if (req.body.hashedPassword) {
                updatedFields.hashedPassword = await bcrypt.hash(req.body.hashedPassword, 12);
            }
        } else {
            // Si un utilisateur normal met à jour son propre mot de passe
            if (req.body.hashedPassword) {
                updatedFields.hashedPassword = await bcrypt.hash(req.body.hashedPassword, 12);
            }
        }

        Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);

        const updatedUser = await Utilisateur.update(updatedFields, { where: { ID_User: targetUserId } });
        if (!updatedUser) {
            return next(new Error('La mise à jour a échoué'));
        }

        res.status(200).json({ success: true, message: 'Informations mises à jour avec succès.' });

        if (Object.keys(updatedFields).length > 0) {
            await Utilisateur.update({ updatedAt: new Date() }, { where: { ID_User: targetUserId } });
        }
    } catch (error) {
        next(error);
    }
};



// Questions de sécurité prédéfinies
exports.QUESTIONS = [
    "Quel est le nom de votre premier animal de compagnie ?",
    "Dans quelle ville avez-vous grandi ?",
    "Quel est le prénom de votre meilleur ami d'enfance ?",
    // ... ajoutez d'autres questions ici
];

// Fonction pour définir la question de sécurité de l'utilisateur
exports.setSecurityQuestion = async (req, res, next) => {
    try {
        const hashedAnswer = await bcrypt.hash(req.body.Reponse_securite, 12);
        const questionIndex = exports.QUESTIONS.indexOf(req.body.Question_securite);
        
        if (questionIndex === -1) {
            return next(new Error('Question non valide'));
        }

        const securityQuestion = await SecuriteUtilisateur.create({
            ID_User: req.user.userId,
            Question_securite: questionIndex,  // Storing the index of the question
            Reponse_securite: hashedAnswer
        });

        res.status(201).json({ success: true, message: "Question de sécurité définie avec succès." });
    } catch (error) {
        next(error);
    }
};

// Fonction pour mettre à jour la question de sécurité de l'utilisateur
exports.updateSecurityQuestion = async (req, res, next) => {
    try {
        const hashedAnswer = await bcrypt.hash(req.body.Reponse_securite, 12);
        const questionIndex = exports.QUESTIONS.indexOf(req.body.Question_securite);
        
        if (questionIndex === -1) {
            return next(new Error('Question non valide'));
        }

        await SecuriteUtilisateur.update({
            Question_securite: questionIndex,  // Updating with the index of the question
            Reponse_securite: hashedAnswer
        }, {
            where: {
                ID_User: req.user.userId
            }
        });

        res.status(200).json({ success: true, message: "Question de sécurité mise à jour avec succès." });
    } catch (error) {
        next(error);
    }
};


exports.resetPasswordRequest = async (req, res, next) => {
    console.log("Email reçu:", req.body.email);
    console.log("Corps de la requête reçue:", req.body);
    try {
        // Trouver l'utilisateur par email
        const user = await Utilisateur.findOne({ where: { Email: req.body.email } });
        if (!user) {
            return next(new Error('Aucun utilisateur trouvé avec cet e-mail'));
        }

        // Trouver la question de sécurité pour l'utilisateur
        const securityUser = await SecuriteUtilisateur.findOne({ where: { ID_User: user.ID_User } });
        if (!securityUser) {
            return next(new Error('Question de sécurité non trouvée pour cet utilisateur'));
        }

        // Récupérer la question de sécurité basée sur l'index
        const securityQuestion = exports.QUESTIONS[securityUser.Question_securite];
        if (!securityQuestion) {
            return res.status(404).json({ message: "Question de sécurité non trouvée." });
        }

        console.log("Question de sécurité envoyée:", securityQuestion);
        res.status(200).json({ question: securityQuestion });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    console.log("Email reçu rest:", req.body.email);
    console.log("Corps de la requête reçue:", req.body);


    try {
        const user = await Utilisateur.findOne({ where: { Email: req.body.email } });
        if (!user) {
            return next(new Error('Aucun utilisateur trouvé avec cet e-mail'));
        }
        const securityUser = await SecuriteUtilisateur.findOne({ where: { ID_User: user.ID_User } });

        if (!securityUser || !securityUser.Reponse_securite) {
            return next(new Error('Réponse de sécurité non trouvée pour cet utilisateur'));
        }
        console.log("Réponse utilisateur:", req.body.answer);
console.log("Réponse sécurisée stockée:", securityUser.Reponse_securite);

        // const isMatch = await bcrypt.compare(req.body.Reponse_securite, securityUser.Reponse_securite);
        const isMatch = await bcrypt.compare(req.body.answer, securityUser.Reponse_securite);

        if (!isMatch) {
            return next(new Error('Réponse incorrecte à la question de sécurité'));
        }
    
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);
        await Utilisateur.update({ hashedPassword: hashedPassword }, { where: { Email: req.body.email } });
        res.status(200).json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        const user = await Utilisateur.findOne({ where: { ID_User: userId } });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword);
        console.log('oldPassword', oldPassword);
        console.log('user.hashedPassword', user.hashedPassword);
        if (!isMatch) {
            console.log('Ancien mot de passe incorrect');
            return res.status(400).json({ message: "Ancien mot de passe incorrect." });
           
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await user.update({ hashedPassword: hashedNewPassword });
        console.log('Mot de passe mis à jour avec succès');
        res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
    } catch (error) {
        next(error);
    }
};


exports.deleteAccount = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.roleId; // Assurez-vous que le roleId est inclus dans le JWT

        let targetUserId = requestingUserId; // Par défaut, c'est l'utilisateur qui fait la requête
        if (requestingUserRole === 2205 && req.body.userId) {
            targetUserId = req.body.userId; // Permettre à l'admin de supprimer le compte d'un autre utilisateur
        }

        // Vérifier si l'utilisateur existe
        const userExists = await Utilisateur.findOne({ where: { ID_User: targetUserId } });
        if (!userExists) {
            await transaction.rollback();
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Mettre à jour l'utilisateur comme supprimé
        await Utilisateur.update({
            Nom: 'Utilisateur Supprimé',
            Prenom: 'Utilisateur Supprimé',
            Image_de_profil: null,
            Statut: 'Hors ligne',
            isDeleted: true
        }, { where: { ID_User: targetUserId }, transaction });

        // Gestion des groupes dont l'utilisateur est l'admin
        const groupesAdmin = await Groupe.findAll({ where: { ID_Admin: targetUserId }, transaction });
        for (let groupe of groupesAdmin) {
            const autresMembres = await MembreGroupe.findAll({
                where: { ID_Groupe: groupe.ID_Groupe, ID_User: { [sequelize.Op.ne]: targetUserId } },
                transaction
            });
            if (autresMembres.length > 0) {
                await groupe.update({ ID_Admin: autresMembres[0].ID_User }, { transaction });
            } else {
                await groupe.destroy({ transaction });
            }
        }

        // Suppression des informations de sécurité, historiques, pièces jointes, etc., si elles existent
        const securityExists = await SecuriteUtilisateur.findOne({ where: { ID_User: targetUserId } });
        if (securityExists) {
            await SecuriteUtilisateur.destroy({ where: { ID_User: targetUserId }, transaction });
        }

        const historyExists = await HistoriqueChangementMotDePasse.findOne({ where: { ID_User: targetUserId } });
        if (historyExists) {
            await HistoriqueChangementMotDePasse.destroy({ where: { ID_User: targetUserId }, transaction });
        }

        // Valider la transaction
        await transaction.commit();

        res.status(200).json({ message: "Compte supprimé avec succès." });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};



exports.getUserInfo = async (req, res, next) => {
    try {
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.roleId; // Assurez-vous que le roleId est inclus dans le JWT

        let targetUserId = requestingUserId; // Par défaut, c'est l'utilisateur qui fait la requête
        if (requestingUserRole === 2205 && req.query.userId) {
            targetUserId = req.query.userId; // Permettre à l'admin de récupérer les infos d'un autre utilisateur
        }

        const user = await Utilisateur.findOne({
            where: { ID_User: targetUserId, isDeleted: false }, 
            attributes: { exclude: ['hashedPassword', 'createdAt', 'updatedAt', 'isDeleted'] }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou supprimé." });
        }

        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.roleId;

        let attributes; // Les attributs à récupérer

        // Si l'utilisateur est un administrateur, récupérer toutes les informations
        if (requestingUserRole === 2205) {
            attributes = { exclude: ['hashedPassword'] }; // Exclure le mot de passe haché
        } else {
            // Si c'est un utilisateur normal, ne récupérer que le nom et le prénom
            attributes = ['Nom', 'Prenom'];
        }

        const users = await Utilisateur.findAll({
            where: { isDeleted: false },
            attributes
        });

        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
};
