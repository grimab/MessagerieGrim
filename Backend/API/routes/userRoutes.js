// Desc: User routes
// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userMiddleware = require('../middlewares/userMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/register', userMiddleware.validateRegister, userController.register);

router.post('/login', userMiddleware.validateLogin, userController.login);

router.put('/update', authMiddleware.authenticateJWT, userMiddleware.validateUpdate, userController.updateUser);



router.post('/set-security', authMiddleware.authenticateJWT, userMiddleware.validateSecurityQuestion, userController.setSecurityQuestion);
router.put('/update-security', authMiddleware.authenticateJWT, userMiddleware.validateSecurityQuestion, userController.updateSecurityQuestion);
router.put('/set-status', authMiddleware.authenticateJWT, userController.setStatus);

router.post('/reset-password-request', userController.resetPasswordRequest);
router.post('/reset-password', userController.resetPassword);

router.put('/change-password', authMiddleware.authenticateJWT, userMiddleware.validateChangePassword, userController.changePassword);

router.delete('/delete', authMiddleware.authenticateJWT, userController.deleteAccount);
router.get('/me', authMiddleware.authenticateJWT, userController.getUserInfo);
router.get('/get-users', authMiddleware.authenticateJWT, userController.getAllUsers);


//exemple de route protégée
// Protégez n'importe quelle route avec le middleware
//router.get('/profile', authMiddleware.authenticateJWT, userController.getProfile);

module.exports = router;
