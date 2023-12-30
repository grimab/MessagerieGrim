
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorMiddleware = require('./API/middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const socketController = require('./API/sockets/socketController.js'); // Assurez-vous que le chemin est correct
const socketTokenStore = require('./API/sockets/webSocketTokenStore.js'); // Assurez-vous que le chemin est correct
// Importez vos routes
const userRoutes = require('./API/routes/userRoutes');
const contactRoutes = require('./API/routes/contactRoutes');
const conversationsRoutes = require('./API/routes/conversationRoutes');

const app = express();

// Clé secrète pour JWT
const SECRET_KEY = "maSuperCleSecrete";

// Options pour HTTPS
const options = {
  key: fs.readFileSync('/home/grim/localhost+3-key.pem'),
  cert: fs.readFileSync('/home/grim/localhost+3.pem')
};

// Configuration CORS
const corsOptions = {
  origin: 'https://192.168.199.129:4200',  
  optionsSuccessStatus: 200, 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// Limitez le nombre de requêtes par adresse IP
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  handler: function(req, res, next) {
    next(new Error('Limite de requêtes dépassée'));
  }
});

app.use("/api/users/register", apiLimiter);
app.use("/api/users/login", apiLimiter);


// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Utilisez les routes d'utilisateur
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationsRoutes);

// Gestion des erreurs
app.use(errorMiddleware);

// Création du serveur HTTPS
const server = https.createServer(options, app);

// Initialisation et configuration du WebSocket Server (WSS)
socketController(server);
// verifier que le WebSocket est corectement connecter
// console.log("WebSocket is connected");

// Interval de nettoyage des conection websocket expirer  toutes les heures 
setInterval(() => {
  socketTokenStore.cleanupExpiredTokens();
  console.log('Nettoyage des tokens expirés effectué');
}, 1000 * 60 * 60); // Nettoie toutes les heures


const PORT = 3443;
server.listen(PORT, () => {
  console.log(`Server is running securely on https://192.168.199.129:${PORT}`);
});

