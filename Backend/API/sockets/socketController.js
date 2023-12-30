// socketController.js

const WebSocket = require("ws");
// const { Utilisateur , Message} = require('../../models');
const { verifyToken } = require("../sockets/webSocketTokenStore");
const Joi = require("joi");
const { Op } = require("sequelize"); // Importez Sequelize Op si ce n'est pas déjà fait
const { Conversation, Message, Utilisateur } = require("../../models"); // Assurez-vous d'importer les modèles nécessaires


function validateMessage(message) {
    let schema;
    
    if (message.type === 'demandeHistoriqueMessages') {
        schema = Joi.object({
            type: Joi.string().required(),
            conversationId: Joi.number().integer().required(),
            // Pas de recipientId pour demandeHistoriqueMessages
        });
    } else {
        // Le schéma par défaut pour les autres types de messages
        schema = Joi.object({
            type: Joi.string().required(),
            conversationId: Joi.number().integer().required(),
            recipientId: Joi.number().integer().required(),
            content: Joi.string().max(500).optional(), // Rendre le contenu optionnel
        });
    }

    return schema.validate(message);
}


function setOffline(userId) {
  // Mettre à jour le statut de l'utilisateur dans la base de données
  Utilisateur.update({ Statut: "Hors ligne" }, { where: { ID_User: userId } })
    .then(() => {
      console.log(
        `Statut de l'utilisateur ${userId} mis à jour en 'Hors ligne'`
      );
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la mise à jour du statut de l'utilisateur:",
        error
      );
    });
}

module.exports = function (server) {
  const wss = new WebSocket.Server({ server });
  const SEUIL_INACTIVITE = 1000 * 60 * 100; // 60 minutes d'inactivité

  const clients = {}; // Stocker les clients WebSocket par ID utilisateur
 console.log("clients", clients);

  wss.on("connection", function connection(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    const userId = verifyToken(token);

    if (!userId) {
      ws.close(4001, "Token non valide");
      return;
    }

    clients[userId] = ws; // Ajouter le WebSocket client au dictionnaire
    console.log("Utilisateur authentifié avec succès web socket:", userId);
    console.log("clients", clients);
    Utilisateur.update({ Statut: "En ligne" }, { where: { ID_User: userId } });

    let inactivityTimer = setTimeout(
      () => setOffline(userId),
      SEUIL_INACTIVITE
    );

    // Après l'authentification de l'utilisateur, envoyer l'historique des messages
    // envoyerHistoriqueMessages(userId).then((historique) => {
    //   if (clients[userId]) {
    //     clients[userId].send(
    //       JSON.stringify({
    //         type: "historiqueMessages",
    //         messages: historique,
    //       })
    //     );
    //   }
    // });

    ws.on("message", function incoming(data) {
      const message = JSON.parse(data);
        console.log("Message reçu:", message);
      const { error } = validateMessage(message);
      if (error) {
        console.error("Validation error:", error.details[0].message);
        return;
      }

      clearTimeout(inactivityTimer); // Logique pour gérer l'inactivité
      inactivityTimer = setTimeout(() => setOffline(userId), SEUIL_INACTIVITE);

      switch (message.type) {
        case "newMessage":
            conversationId = message.conversationId; // Assigner la valeur ici
            const { recipientId, content } = message;
          handleNewMessage(userId, recipientId, conversationId, content);
          break;
        case "updateStatus":
          const { newStatus } = message;
          updateMessageStatus(conversationId, userId, newStatus);
          break;
          case 'demandeHistoriqueMessages':
            conversationId = message.conversationId; 
             console.log("Demande d'historique de messages pour la conversation:", conversationId);
            // Appeler une fonction pour envoyer l'historique des messages
            envoyerHistoriqueMessagesPourConversation(userId, conversationId);
            break;
        // Ajoutez des cas supplémentaires pour d'autres types de messages
      }
    });

    // async function envoyerHistoriqueMessagesPourConversation(userId, conversationId) {
    //     try {
    //         // Vérifier si l'utilisateur fait partie de la conversation
    //         const conversation = await Conversation.findOne({
    //             where: { ID_Conversation: conversationId, [Op.or]: [{ ID_User1: userId }, { ID_User2: userId }] }
    //         });
    
    //         if (!conversation) {
    //             console.log("Conversation non trouvée ou utilisateur non autorisé.");
    //             return;
    //         }
    
    //         // Récupérer les messages de la conversation spécifiée
    //         const messages = await Message.findAll({
    //             where: { ID_Conversation: conversationId },
    //             include: [{
    //                 model: Utilisateur,
    //                 as: 'Utilisateur',
    //                 attributes: ['Nom', 'Prenom', 'ID_User']
    //             }],
    //             order: [['Date_et_heure', 'ASC']]
    //         });
    
    //         // Préparer les messages pour l'envoi
    //         const messagesForClient = messages.map(message => ({
    //             ...message.get({ plain: true }),
    //             isSentByCurrentUser: message.Utilisateur.ID_User === userId
    //         }));
    
    //         // Envoyer les messages via WebSocket
    //         if (clients[userId]) {
    //             clients[userId].send(JSON.stringify({
    //                 type: 'historiqueMessages',
    //                 conversationId: conversationId,
    //                 messages: messagesForClient
    //             }));
    //         }
    //         console.log(`Historique des messages envoyé pour la conversation ${conversationId}`);
    //         console.log(`messaege for client ${messagesForClient}`);
    //     } catch (error) {
    //         console.error(`Erreur lors de l'envoi de l'historique des messages : ${error.message}`);
    //     }
    // }
    
    async function envoyerHistoriqueMessagesPourConversation(userId, conversationId) {
        try {
            // Vérifier si l'utilisateur fait partie de la conversation
            const conversation = await Conversation.findOne({
                where: { ID_Conversation: conversationId, [Op.or]: [{ ID_User1: userId }, { ID_User2: userId }] },
                attributes: ['ID_Conversation', 'ID_User1', 'ID_User2', 'Confidentialite', 'Dernier_message', 'createdAt', 'updatedAt']
            });
    
            if (!conversation) {
                console.log("Conversation non trouvée ou utilisateur non autorisé.");
                return;
            }
    
            // Récupérer les messages de la conversation spécifiée
            const messages = await Message.findAll({
                where: { ID_Conversation: conversationId },
                include: [{
                    model: Utilisateur,
                    as: 'Utilisateur',
                    attributes: ['Nom', 'Prenom', 'ID_User']
                }],
                order: [['Date_et_heure', 'ASC']]
            });
    
            // Préparer les messages pour l'envoi
            const messagesForClient = messages.map(message => ({
                ...message.get({ plain: true }),
                isSentByCurrentUser: message.Utilisateur.ID_User === userId
            }));
    
            // Envoyer les messages via WebSocket
            if (clients[userId]) {
                clients[userId].send(JSON.stringify({
                    type: 'historiqueMessages',
                    conversationId: conversationId, 
                    messages: messagesForClient
                }));
            }
            console.log(`Historique des messages envoyé pour la conversation ${conversationId}`);
            console.log(`Messages pour le client historique :`, messagesForClient);
            console.log('clients histoirque', clients);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de l'historique des messages : ${error.message}`);
        }
    }
    
    // async function envoyerHistoriqueMessages(userId) {
    //   try {
    //     // Trouver toutes les conversations pour cet utilisateur
    //     const conversations = await Conversation.findAll({
    //       where: {
    //         [Op.or]: [{ ID_User1: userId }, { ID_User2: userId }],
    //       },
    //       attributes: ["ID_Conversation"],
    //     });

    //     let messagesHistorique = [];

    //     // Parcourir chaque conversation pour récupérer les messages
    //     for (let conversation of conversations) {
    //       const messages = await Message.findAll({
    //         where: { ID_Conversation: conversation.ID_Conversation },
    //         include: [
    //           {
    //             model: Utilisateur,
    //             as: "Utilisateur",
    //             attributes: ["Nom", "Prenom", "ID_User"],
    //           },
    //         ],
    //         order: [["Date_et_heure", "ASC"]],
    //       });

    //       const messagesWithSenderInfo = messages.map((message) => ({
    //         ...message.get({ plain: true }),
    //         isSentByCurrentUser: message.Utilisateur.ID_User === userId,
    //       }));

    //       messagesHistorique = [
    //         ...messagesHistorique,
    //         ...messagesWithSenderInfo,
    //       ];
    //     }

    //     return messagesHistorique;
    //   } catch (error) {
    //     console.error(
    //       `Erreur lors de la récupération des messages : ${error.message}`
    //     );
    //     return [];
    //   }
    // }

    ws.on("close", function close() {
      console.log("Client déconnecté", userId);
      console.log("clients close ", clients);
      delete clients[userId]; // Retirer le WebSocket client du dictionnaire
      clearTimeout(inactivityTimer);
      setOffline(userId);
    });

    ws.on("error", function error(error) {
      console.log("Erreur WebSocket:", error);
      console.error("WebSocket error:", error);
    });
  });


// fonction pour envoyer un  message 
  
  // function handleNewMessage(senderId, recipientId, conversationId, content,userId) {
  //   storeMessage(conversationId, senderId, content)
  //     .then(async (savedMessage) => {
  //       console.log("Message enregistré:", savedMessage);
  
  //       // Récupérez des informations supplémentaires sur l'utilisateur
  //       const utilisateur = await Utilisateur.findByPk(senderId);
  
  //       // Structure du message pour l'envoi
  //       const messageForClient = {
  //         ...savedMessage.get({ plain: true }),
  //         Utilisateur: {
  //           Nom: utilisateur.Nom,
  //           Prenom: utilisateur.Prenom,
  //           ID_User: utilisateur.ID_User
  //         },
  //         // verifier si le message est envoyé par l'utilisateur courant
  //         isSentByCurrentUser: savedMessage.ID_User === userId

          
  //         // isSentByCurrentUser: savedMessageData.ID_User === userId
  //         // isSentByCurrentUser: senderId === userId // Mettez à jour selon la logique appropriée
  //       };
  
  //       const messageToSend = {
  //         type: "newMessage",
  //         data: {
  //           conversationId: conversationId,
  //           messages: [messageForClient] // Un seul message dans un tableau
  //         }
  //       };

       
  //       // Envoi du message à l'expéditeur (confirmation) et au destinataire si connecté
  //       [senderId, recipientId].forEach(id => {
  //         if (clients[id]) {
  //           clients[id].send(JSON.stringify(messageToSend));
  //         }
  //       });


  //       console.log(`Messages pour le client historique new message  :`, [messageForClient]);
  //     })

      
  //     .catch((error) => {
  //       console.error("Erreur lors de l'enregistrement du message:", error);
  //     });
  // }
  

  function handleNewMessage(senderId, recipientId, conversationId, content, userId) {
    storeMessage(conversationId, senderId, content)
      .then(async (savedMessage) => {
        // Assurez-vous que savedMessageData est correctement défini
        const savedMessageData = savedMessage.get({ plain: true });
  
        const utilisateur = await Utilisateur.findByPk(senderId);
  


        console.log('Comparaison pour isSentByCurrentUser:', 'ID_User du message:', savedMessageData.ID_User, 'userId:', userId , 'senderId:', senderId);
        // Ensuite, utilisez savedMessageData dans la structure du message
        const messageForClient = {
          ...savedMessageData,
          Utilisateur: {
            Nom: utilisateur.Nom,
            Prenom: utilisateur.Prenom,
            ID_User: utilisateur.ID_User
          },
          isSentByCurrentUser: savedMessageData.ID_User === senderId
        };
  
             const messageToSend = {
          type: "newMessage",
          data: {
            conversationId: conversationId,
            messages: [messageForClient] // Un seul message dans un tableau
          }
        };

       
        // Envoi du message à l'expéditeur (confirmation) et au destinataire si connecté
        [senderId, recipientId].forEach(id => {
          if (clients[id]) {
            clients[id].send(JSON.stringify(messageToSend));
          }
        });


        console.log(`Messages pour le client historique new message  :`, [messageForClient]);
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du message:", error);
      });
  }
  


  function storeMessage(conversationId, senderId, content) {
    return Message.create({
      ID_Conversation: conversationId,
      ID_User: senderId,
      Contenu_du_message: content,
      Date_et_heure: new Date(),
      Statut_du_message: "Envoyé", // Vous pouvez définir le statut initial ici
    })
      .then((message) => {

        console.log("Message enregistré: store", message);
        return message;

        // Vous pouvez effectuer des actions supplémentaires ici si nécessaire
      })
      .catch((error) => {
        console.error("Erreur lors de l'enregistrement du message:", error);
      });
  }

  function updateMessageStatus(conversationId, userId, newStatus) {
    return Message.update(
      { Statut_du_message: newStatus },
      {
        where: {
          ID_Conversation: conversationId,
          ID_User: userId,
          Statut_du_message: "Envoyé",
        },
      }
    )
      .then((result) => {
        console.log(`Nombre de messages mis à jour : ${result}`);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la mise à jour du statut des messages:",
          error
        );
      });
  }
};
