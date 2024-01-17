const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assurez-vous que ce chemin est correct


// Route pour ajouter un contact
router.post('/add', authMiddleware.authenticateJWT, contactController.addContact);

// Route pour supprimer un contact
router.delete('/remove', authMiddleware.authenticateJWT, contactController.removeContact);

// Route pour lister tous les contacts
router.get('/amies', authMiddleware.authenticateJWT, contactController.getContacts);

// Route pour modifier le statut d'un contact
router.put('/status', authMiddleware.authenticateJWT, contactController.updateContactStatus);

// Route pour lister tous les utilisateurs
router.get('/users', authMiddleware.authenticateJWT, contactController.getAllUsers);

// Route pour lister les utilisateur bloquer par l'utilisateur
router.get('/block', authMiddleware.authenticateJWT, contactController.getContactblock);

// route pour acepter une invitation
router.put('/accept', authMiddleware.authenticateJWT, contactController.approuveContactRequest);

//route pour lister les invitations
router.get('/invitation', authMiddleware.authenticateJWT, contactController.getPendingContactRequests);

// route pour cree un groupe
router.post('/addgroup', authMiddleware.authenticateJWT, contactController.createGroup);

// route pour mettre a jour un groupe
router.put('/updategroup', authMiddleware.authenticateJWT, contactController.updateGroup);

// route pour recuperer les membres d'un groupe
router.post('/groupmembers', authMiddleware.authenticateJWT, contactController.getGroupMembers);

// route pour supprimer un groupe
router.post('/deletegroup', authMiddleware.authenticateJWT, contactController.deleteGroup);

// route pour recuperer les groupes d'un utilisateur
router.get('/groups', authMiddleware.authenticateJWT, contactController.getUserGroups);

module.exports = router;
