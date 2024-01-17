// // userMiddleware.js

// // Définition des middlewares pour les routes utilisateurs

// exports.validateRegister = (req, res, next) => {
//     if (!req.body.Nom || !req.body.Prenom || !req.body.Email || !req.body.hashedPassword) {

//         return next(new Error('Tous les champs sont requis'));
//     }

// // Vérifiez si le mot de passe contient au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et a au moins 8 caractères
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

//     if (!passwordRegex.test(req.body.hashedPassword)) {
//         return next(new Error('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères.'));
//     }
//     next();
// };

// exports.validateLogin = (req, res, next) => {
//     if (!req.body.Email || !req.body.hashedPassword) {
//         return next(new Error('Email et mot de passe sont requis'));
//     }
//     next();
// };

// exports.validateUpdate = (req, res, next) => {
//     // Si aucun champ (Nom, Prenom, hashedPassword) n'est fourni
//     if (!req.body.Nom && !req.body.Prenom && !req.body.hashedPassword) {
//         return next(new Error('Au moins un champ à mettre à jour est requis'));
//     }

//     // Si le mot de passe est fourni, validez-le comme vous l'avez fait lors de l'inscription
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

//     if (req.body.hashedPassword && !passwordRegex.test(req.body.hashedPassword)) {
//         return next(new Error('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères.'));
//     }

//     next();
// };

// exports.validateSecurityQuestion = (req, res, next) => {
//     if (!req.body.Question_securite || !req.body.Reponse_securite) {
//         return next(new Error('La question et la réponse de sécurité sont requises'));
//     }
//     next();
// };

// exports.validateChangePassword = (req, res, next) => {
//     const { oldPassword, newPassword } = req.body;

//     if (!oldPassword || !newPassword) {
//         return next(new Error('L\'ancien mot de passe et le nouveau mot de passe sont requis'));
//     }

//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

//     if (!passwordRegex.test(newPassword)) {
//         return next(new Error('Le nouveau mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères.'));
//     }

//     next();
// };

// userMiddleware.js
// Définition des middlewares pour les routes utilisateurs

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const nameRegex =
  /^[a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+([-'\s][a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+)*$/;

const validateEmail = (email) => emailRegex.test(email);
const validatePassword = (password) => passwordRegex.test(password);
const validateName = (name) => nameRegex.test(name);

exports.validateRegister = (req, res, next) => {
  if (
    !req.body.Nom ||
    !req.body.Prenom ||
    !req.body.Email ||
    !req.body.hashedPassword
  ) {
    return next(new Error("Tous les champs sont requis"));
  }

  if (!validateEmail(req.body.Email)) {
    return next(new Error("Format d'email invalide"));
  }

  if (!validatePassword(req.body.hashedPassword)) {
    return next(
      new Error(
        "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères."
      )
    );
  }
  if (!validateName(req.body.Nom)) {
    return next(
      new Error(
        "Le nom doit contenir uniquement des lettres et des tirets si besoin"
      )
    );
  }
  if (!validateName(req.body.Prenom)) {
    return next(
      new Error(
        "Le prénom doit contenir uniquement des lettres et des tirets si besoin"
      )
    );
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  if (!req.body.Email || !req.body.hashedPassword) {
    return next(new Error("Email et mot de passe sont requis"));
  }

  if (!validateEmail(req.body.Email)) {
    return next(new Error("Format d'email invalide"));
  }
  if (!validatePassword(req.body.hashedPassword)) {
    return next(
      new Error(
        "Le mot de passe doit contenir uniquement des lettres,chiffres, et seul ces caractères spécial (@$!%*?&#) sont autoriser."
      )
    );
  }

  next();
};

exports.validateUpdate = (req, res, next) => {
  if (!req.body.Nom && !req.body.Prenom && !req.body.hashedPassword) {
    return next(new Error("Au moins un champ à mettre à jour est requis"));
  }
  if (!validateName(req.body.Nom)) {
    return next(
      new Error(
        "Le nom doit contenir uniquement des lettres et des tirets si besoin"
      )
    );
  }
  if (!validateName(req.body.Prenom)) {
    return next(
      new Error(
        "Le prénom doit contenir uniquement des lettres et des tirets si besoin"
      )
    );
  }

  if (req.body.hashedPassword && !validatePassword(req.body.hashedPassword)) {
    return next(
      new Error(
        "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères."
      )
    );
  }

  next();
};

exports.validateSecurityQuestion = (req, res, next) => {
  if (!req.body.Question_securite || !req.body.Reponse_securite) {
    console.log(
      "Requête reçue pour la validation de la question de sécurité:",
      req.body
    );
    return next(
      new Error("La question et la réponse de sécurité sont requises")
    );
  }
  // Ajouter ici des validations supplémentaires pour les questions/réponses de sécurité
  next();
};

exports.validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  console.log("Requête reçue pour le changement de mot de passe:", req.body);

  if (!oldPassword || !newPassword) {
    return next(
      new Error("L'ancien mot de passe et le nouveau mot de passe sont requis")
    );
  }

  if (!validatePassword(newPassword)) {
    return next(
      new Error(
        "Le nouveau mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre, un caractère spécial (@$!%*?&#) et avoir au moins 8 caractères."
      )
    );
  }

  next();
};
