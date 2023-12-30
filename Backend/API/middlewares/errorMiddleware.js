// errorMiddleware.js

module.exports = function errorMiddleware(err, req, res, next) {
    console.error(err.stack); // Imprime l'erreur dans la console


    if (err.message === 'Limite de requêtes dépassée') {
        return res.status(429).json({ error: "Trop de requêtes. Veuillez réessayer plus tard." });
    }
    
    if (err.message === 'Accès interdit') {
        return res.status(403).json({ error: err.message });
    }
    
    if (err.message === 'Authentification requise') {
        return res.status(401).json({ error: err.message });
    }

  // Vérifiez si l'erreur est une violation de contrainte unique
  if (err.name === 'SequelizeUniqueConstraintError') { // Si l'erreur est une violation de contrainte unique 
    const message = err.errors && err.errors[0] && err.errors[0].message;  // On récupère le message d'erreur 
    if (message && message.includes('Email')) { // Si le message d'erreur contient le mot 'Email'
        return res.status(400).json({ error: "L'adresse e-mail est déjà utilisée." });
    }
    else {
        res.status(500).json({ success: false, message: "Erreur lors de la création de l'utilisateur. Veuillez réessayer." });
    }
    }

    // Vérifiez si l'erreur est une violation de format d'email
if (err.name === 'SequelizeValidationError') { 
    const message = err.errors && err.errors[0] && err.errors[0].message;  
    if (message && message.includes('isEmail')) { 
        return res.status(400).json({ error: "L'adresse e-mail est invalide." });
    }
}

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Une erreur est survenue sur le serveur.',
            data: err.data || { } // Vous pouvez ajouter des données supplémentaires si nécessaire
        }
    });
};
