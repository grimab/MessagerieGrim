// authMiddleware.js


// Importer le module 'jsonwebtoken' pour travailler avec les JWT (Jetons Web JSON)
const jwt = require('jsonwebtoken');

// Clé secrète utilisée pour signer et vérifier les JWT. Elle doit être gardée secrète.
const SECRET_KEY = "maSuperCleSecrete";

// Middleware pour authentifier les requêtes avec un JWT
exports.authenticateJWT = (req, res, next) => {

    // // Récupérer l'en-tête 'Authorization' de la requête entrante
    // const authHeader = req.headers.authorization;

    // // Vérifier si l'en-tête 'Authorization' existe
    // if (authHeader) {

       
         // extraire le token du cookie
        const token = req.cookies.auth_token;

         // Vérifier si le token est présent
    if (token) {
        // Vérifier la validité du JWT
        jwt.verify(token, SECRET_KEY, (err, user) => {
            // Si une erreur se produit lors de la vérification, renvoyer un statut 403 (Forbidden)
            if (err) {
                return next(new Error('Accès interdit'));
            }

            // Si le JWT est valide, attacher les données de l'utilisateur à l'objet req
            req.user = user;
            next();  // Passez au prochain middleware ou contrôleur
        });
    } else {
        // Si le token est absent, renvoyer un statut 401 (Unauthorized)
        next(new Error('Authentification requise'));
    }
// };
}