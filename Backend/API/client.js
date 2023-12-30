// // const WebSocket = require('ws');

// // const ws = new WebSocket('wss://192.168.199.129:3443', {
// //   rejectUnauthorized: false // À utiliser uniquement à des fins de test
// // });

// // ws.on('open', function open() {
// //   console.log('Connecté au serveur');
// //   ws.send('Salut, serveur!');
// // });

// // ws.on('message', function incoming(data) {
// //   console.log(data);
// // });

// // ws.on('error', function error(err) {
// //   console.error('Erreur de connexion:', err);
// // });

// const axios = require('axios');
// const WebSocket = require('ws');

// const apiUrl = 'https://192.168.199.129:3443/api/users/login';
// const wsUrl = 'wss://192.168.199.129:3443'; // Modifiez en fonction de votre URL WebSocket
// const credentials = {
//   Email: 'grim@gmail.com',
//   hashedPassword: 'Root2023#'
// };

// // Fonction pour s'authentifier et obtenir un token JWT
// async function authenticateAndGetToken() {
//   try {
//     const response = await axios.post(apiUrl, credentials, {
//       withCredentials: true // Permet de gérer les cookies
//     });
//     return response.data.token; // ou le chemin approprié pour obtenir le token
//   } catch (error) {
//     console.error('Erreur d\'authentification:', error);
//     return null;
//   }
// }

// // Fonction pour connecter le WebSocket avec le token JWT
// function connectWebSocket(token) {
//   const ws = new WebSocket(wsUrl, {
//     headers: { 'Cookie': `auth_token=${token}` },
//     rejectUnauthorized: false // Désactive la vérification du certificat (NON RECOMMANDÉ en production)
//   });
  

//   ws.on('open', () => {
//     console.log('Connecté au serveur WebSocket');
//     // Attendre pour tester l'inactivité
//     setTimeout(() => {
//       ws.close();
//       console.log('WebSocket fermé après la période d\'inactivité');
//       // Ici, vous pouvez vérifier dans votre base de données si l'utilisateur est 'Hors ligne'
//     }, 60000); // Modifier en fonction du seuil d'inactivité (ici 60 secondes)
//   });

//   ws.on('error', (error) => {
//     console.error('Erreur WebSocket:', error);
//   });
// }

// // Exécution principale
// (async () => {
//   const token = await authenticateAndGetToken();
//   if (token) {
//     connectWebSocket(token);
//   } else {
//     console.log('Impossible de se connecter au WebSocket sans token valide');
//   }
// })();


const WebSocket = require('ws');


// Fonction pour connecter le WebSocket avec un cookie valide
function connectWebSocket() {
  // Remplacez 'votre_cookie_valide' par la valeur de votre cookie valide
  const validCookie = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMzLCJpYXQiOjE3MDA4MzUxNTIsImV4cCI6MTcwMDkyMTU1Mn0.5MtpizgBUfSTw_E1qQ92a2MB41GNGSldFKIU6qDDhy4';
  console.log('Cookie envoyé:', validCookie);

  const ws = new WebSocket('wss://192.168.199.129:3443', {
    headers: { 'Cookie': `auth_token=${validCookie}` },
    rejectUnauthorized: false // Désactive la vérification du certificat (NON RECOMMANDÉ en production)
  });

  ws.on('open', () => {
    console.log('Connecté au serveur WebSocket');
    // Attendre pour tester l'inactivité
    setTimeout(() => {
      ws.close();
      console.log('WebSocket fermé après la période d\'inactivité');
      // Ici, vous pouvez vérifier dans votre base de données si l'utilisateur est 'Hors ligne'
    }, 60000); // Modifier en fonction du seuil d'inactivité (ici 60 secondes)
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });
}

// Exécution principale
connectWebSocket();
