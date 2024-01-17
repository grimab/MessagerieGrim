// Desc: User routes
// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userMiddleware = require('../middlewares/userMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// route pour s'inscrire
router.post('/register', userMiddleware.validateRegister, userController.register);
// route pour se connecter
router.post('/login', userMiddleware.validateLogin, userController.login);
// route pour modifier les infos de l'utilisateur
router.put('/update', authMiddleware.authenticateJWT, userMiddleware.validateUpdate, userController.updateUser);


// route pour definir la question de securité
router.post('/set-security', authMiddleware.authenticateJWT, userMiddleware.validateSecurityQuestion, userController.setSecurityQuestion);
// route pour modifier la question de securité
router.put('/update-security', authMiddleware.authenticateJWT, userMiddleware.validateSecurityQuestion, userController.updateSecurityQuestion);
// route pour modifier le status de connexion
router.put('/set-status', authMiddleware.authenticateJWT, userController.setStatus);

// route pour la demande de changement de mot de passe non connecté
router.post('/reset-password-request', userController.resetPasswordRequest);
router.post('/reset-password', userController.resetPassword);

// route pour changer le mot de passe
router.put('/change-password', authMiddleware.authenticateJWT, userMiddleware.validateChangePassword, userController.changePassword);

// route pour supprimer le compte
router.delete('/delete', authMiddleware.authenticateJWT, userController.deleteAccount);

// route pour recuperer les infos de l'utilisateur connecté
router.get('/me', authMiddleware.authenticateJWT, userController.getUserInfo);

// route pour recuperer les utilisateurs
router.get('/get-users', authMiddleware.authenticateJWT, userController.getAllUsers);

// route de deconection 
router.delete('/Deconnexion', authMiddleware.authenticateJWT, userController.Deconnexion);


//exemple de route protégée
// Protégez n'importe quelle route avec le middleware
//router.get('/profile', authMiddleware.authenticateJWT, userController.getProfile);

module.exports = router;
