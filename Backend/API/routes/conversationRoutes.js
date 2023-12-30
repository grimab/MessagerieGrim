const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Route pour créer une conversation
router.post('/create', authMiddleware.authenticateJWT, conversationController.createConversation);

// Route pour récupérer les conversations
router.get('/getAllConversation', authMiddleware.authenticateJWT, conversationController.getConversations);

// Route pour supprimer une conversation
router.delete('/delete', authMiddleware.authenticateJWT, conversationController.deleteConversation);


// Route pour récupérer les messages d'une conversation spécifique
// Utilisation d'un paramètre de requête
// router.get('/getMessages', authMiddleware.authenticateJWT, conversationController.getMessages);

// Route pour suprimer une conversation confidentielle
// router.delete('/deleteConfidential', authMiddleware.authenticateJWT, conversationController.deleteConfidentialConversation);
module.exports = router;
