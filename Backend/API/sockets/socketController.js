// // socketController.js

// const WebSocket = require("ws");
// // const { Utilisateur , Message} = require('../../models');
// const { verifyToken } = require("../sockets/webSocketTokenStore");
// const Joi = require("joi");
// const { Op } = require("sequelize"); // Importez Sequelize Op si ce n'est pas déjà fait
// const { Conversation, Message, Utilisateur } = require("../../models"); // Assurez-vous d'importer les modèles nécessaires

// function validateMessage(message) {
//   let schema;

//   if (message.type === "demandeHistoriqueMessages") {
//     schema = Joi.object({
//       type: Joi.string().required(),
//       conversationId: Joi.number().integer().required(),
//       // Pas de recipientId pour demandeHistoriqueMessages
//     });
//   } else {
//     // Le schéma par défaut pour les autres types de messages
//     schema = Joi.object({
//       type: Joi.string().required(),
//       conversationId: Joi.number().integer().required(),
//       recipientId: Joi.number().integer().required(),
//       content: Joi.string().max(500).optional(), // Rendre le contenu optionnel
//     });
//   }

//   return schema.validate(message);
// }

// function setOffline(userId) {
//   // Mettre à jour le statut de l'utilisateur dans la base de données
//   Utilisateur.update({ Statut: "Hors ligne" }, { where: { ID_User: userId } })
//     .then(() => {
//       console.log(
//         `Statut de l'utilisateur ${userId} mis à jour en 'Hors ligne'`
//       );
//     })
//     .catch((error) => {
//       console.error(
//         "Erreur lors de la mise à jour du statut de l'utilisateur:",
//         error
//       );
//     });
// }

// module.exports = function (server) {
//   const wss = new WebSocket.Server({ server });
//   const SEUIL_INACTIVITE = 1000 * 60 * 100; // 60 minutes d'inactivité

//   const clients = {}; // Stocker les clients WebSocket par ID utilisateur
//   console.log("clients", clients);

//   wss.on("connection", function connection(ws, req) {
//     const url = new URL(req.url, `http://${req.headers.host}`);
//     const token = url.searchParams.get("token");
//     const userId = verifyToken(token);

//     if (!userId) {
//       ws.close(4001, "Token non valide");
//       return;
//     }

//     clients[userId] = ws; // Ajouter le WebSocket client au dictionnaire
//     console.log("Utilisateur authentifié avec succès web socket:", userId);
//     console.log("clients", clients);
//     Utilisateur.update({ Statut: "En ligne" }, { where: { ID_User: userId } });

//     let inactivityTimer = setTimeout(
//       () => setOffline(userId),
//       SEUIL_INACTIVITE
//     );

//     ws.on("message", function incoming(data) {
//       const message = JSON.parse(data);
//       console.log("Message reçu:", message);
//       const { error } = validateMessage(message);
//       if (error) {
//         console.error("Validation error:", error.details[0].message);
//         return;
//       }

//       clearTimeout(inactivityTimer); // Logique pour gérer l'inactivité
//       inactivityTimer = setTimeout(() => setOffline(userId), SEUIL_INACTIVITE);

//       switch (message.type) {
//         case "newMessage":
//           conversationId = message.conversationId; // Assigner la valeur ici
//           const { recipientId, content } = message;
//           handleNewMessage(userId, recipientId, conversationId, content);
//           break;
//         case "updateStatus":
//           const { newStatus } = message;
//           updateMessageStatus(conversationId, userId, newStatus);
//           break;
//         case "demandeHistoriqueMessages":
//           conversationId = message.conversationId;
//           console.log(
//             "Demande d'historique de messages pour la conversation:",
//             conversationId
//           );
//           // Appeler une fonction pour envoyer l'historique des messages
//           envoyerHistoriqueMessagesPourConversation(userId, conversationId);
//           break;
//           // case "newMessageGroupe":
//           //   const { groupId, content } = message;
//           //   handleNewGroupMessage(userId, groupId, content);
//           //   break;

//         // Ajoutez des cas supplémentaires pour d'autres types de messages
//       }
//     });

//     async function envoyerHistoriqueMessagesPourConversation(
//       userId,
//       conversationId
//     ) {
//       try {
//         // Vérifier si l'utilisateur fait partie de la conversation
//         const conversation = await Conversation.findOne({
//           where: {
//             ID_Conversation: conversationId,
//             [Op.or]: [{ ID_User1: userId }, { ID_User2: userId }],
//           },
//           attributes: [
//             "ID_Conversation",
//             "ID_User1",
//             "ID_User2",
//             "Confidentialite",
//             "Dernier_message",
//             "createdAt",
//             "updatedAt",
//           ],
//         });

//         if (!conversation) {
//           console.log("Conversation non trouvée ou utilisateur non autorisé.");
//           return;
//         }

//         // Récupérer les messages de la conversation spécifiée
//         const messages = await Message.findAll({
//           where: { ID_Conversation: conversationId },
//           include: [
//             {
//               model: Utilisateur,
//               as: "Utilisateur",
//               attributes: ["Nom", "Prenom", "ID_User"],
//             },
//           ],
//           order: [["Date_et_heure", "ASC"]],
//         });

//         // Préparer les messages pour l'envoi
//         const messagesForClient = messages.map((message) => ({
//           ...message.get({ plain: true }),
//           isSentByCurrentUser: message.Utilisateur.ID_User === userId,
//         }));

//         // Envoyer les messages via WebSocket
//         if (clients[userId]) {
//           clients[userId].send(
//             JSON.stringify({
//               type: "historiqueMessages",
//               conversationId: conversationId,
//               messages: messagesForClient,
//             })
//           );
//         }
//         console.log(
//           `Historique des messages envoyé pour la conversation ${conversationId}`
//         );
//         console.log(`Messages pour le client historique :`, messagesForClient);
//         console.log("clients histoirque", clients);
//       } catch (error) {
//         console.error(
//           `Erreur lors de l'envoi de l'historique des messages : ${error.message}`
//         );
//       }
//     }

//     ws.on("close", function close() {
//       console.log("Client déconnecté", userId);
//       console.log("clients close ", clients);
//       delete clients[userId]; // Retirer le WebSocket client du dictionnaire
//       clearTimeout(inactivityTimer);
//       setOffline(userId);
//     });

//     ws.on("error", function error(error) {
//       console.log("Erreur WebSocket:", error);
//       console.error("WebSocket error:", error);
//     });
//   });

//   function handleNewMessage(
//     senderId,
//     recipientId,
//     conversationId,
//     content,
//     userId
//   ) {
//     storeMessage(conversationId, senderId, content)
//       .then(async (savedMessage) => {
//         // Assurez-vous que savedMessageData est correctement défini
//         const savedMessageData = savedMessage.get({ plain: true });

//         const utilisateur = await Utilisateur.findByPk(senderId);

//         console.log(
//           "Comparaison pour isSentByCurrentUser:",
//           "ID_User du message:",
//           savedMessageData.ID_User,
//           "userId:",
//           userId,
//           "senderId:",
//           senderId
//         );
//         // Ensuite, utilisez savedMessageData dans la structure du message
//         const messageForClient = {
//           ...savedMessageData,
//           Utilisateur: {
//             Nom: utilisateur.Nom,
//             Prenom: utilisateur.Prenom,
//             ID_User: utilisateur.ID_User,
//           },
//           isSentByCurrentUser: savedMessageData.ID_User === senderId,
//         };

//         const messageToSend = {
//           type: "newMessage",
//           data: {
//             conversationId: conversationId,
//             messages: [messageForClient], // Un seul message dans un tableau
//           },
//         };

//         // Envoi du message à l'expéditeur (confirmation) et au destinataire si connecté
//         [senderId, recipientId].forEach((id) => {
//           if (clients[id]) {
//             clients[id].send(JSON.stringify(messageToSend));
//           }
//         });

//         console.log(`Messages pour le client historique new message  :`, [
//           messageForClient,
//         ]);
//       })
//       .catch((error) => {
//         console.error("Erreur lors de l'enregistrement du message:", error);
//       });
//   }

//   function storeMessage(conversationId, senderId, content) {
//     return Message.create({
//       ID_Conversation: conversationId,
//       ID_User: senderId,
//       Contenu_du_message: content,
//       Date_et_heure: new Date(),
//       Statut_du_message: "Envoyé", // Vous pouvez définir le statut initial ici
//     })
//       .then((message) => {
//         console.log("Message enregistré: store", message);
//         return message;

//         // Vous pouvez effectuer des actions supplémentaires ici si nécessaire
//       })
//       .catch((error) => {
//         console.error("Erreur lors de l'enregistrement du message:", error);
//       });
//   }

//   function updateMessageStatus(conversationId, userId, newStatus) {
//     return Message.update(
//       { Statut_du_message: newStatus },
//       {
//         where: {
//           ID_Conversation: conversationId,
//           ID_User: userId,
//           Statut_du_message: "Envoyé",
//         },
//       }
//     )
//       .then((result) => {
//         console.log(`Nombre de messages mis à jour : ${result}`);
//       })
//       .catch((error) => {
//         console.error(
//           "Erreur lors de la mise à jour du statut des messages:",
//           error
//         );
//       });
//   }
// };

// socketController.js

const WebSocket = require("ws");
// const { Utilisateur , Message} = require('../../models');
const { verifyToken } = require("../sockets/webSocketTokenStore");
const Joi = require("joi");
const { Op } = require("sequelize"); // Importez Sequelize Op si ce n'est pas déjà fait
const {
  Conversation,
  Message,
  Utilisateur,
  MembreGroupe,
  MessageGroupe,
} = require("../../models"); // Assurez-vous d'importer les modèles nécessaires

function validateMessage(message) {
  let schema;

  if (message.type === "demandeHistoriqueMessages") {
    schema = Joi.object({
      type: Joi.string().required(),
      conversationId: Joi.number().integer().required(),
      // Pas de recipientId pour demandeHistoriqueMessages
    });
  } else if (message.type === "demandeHistoriqueMessagesGroupe") {
    schema = Joi.object({
      type: Joi.string().required(),
      groupId: Joi.number().integer().required(),
      // Pas de recipientId pour demandeHistoriqueMessagesGroupe
    });
  } else if (message.type === "newGroupMessage") {
    schema = Joi.object({
      type: Joi.string().required(),
      groupId: Joi.number().integer().required(),
      content: Joi.string().max(500).required(),
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

      let groupId, content, conversationId; // Déclarez ici

      switch (message.type) {
        case "newMessage":
          // Utilisez la variable déjà déclarée
          conversationId = message.conversationId;
          const { recipientId } = message;
          content = message.content;
          handleNewMessage(userId, recipientId, conversationId, content);
          break;
        case "updateStatus":
          const { newStatus } = message;
          updateMessageStatus(conversationId, userId, newStatus);
          break;
        case "demandeHistoriqueMessages":
          // Utilisez la variable déjà déclarée
          conversationId = message.conversationId;
          console.log(
            "Demande d'historique de messages pour la conversation:",
            conversationId
          );
          envoyerHistoriqueMessagesPourConversation(userId, conversationId);
          break;
        case "newGroupMessage":
          groupId = message.groupId;
          content = message.content;
          console.log("newGroupMessage", groupId);
          handleNewGroupMessage(userId, groupId, content);
          break;
        case "demandeHistoriqueMessagesGroupe":
          groupId = message.groupId;
          console.log(
            "Demande d'historique de messages pour le groupe:",
            groupId
          );
          envoyerHistoriqueMessagesPourGroupe(userId, groupId);
          break;
      }

      async function envoyerHistoriqueMessagesPourConversation(
        userId,
        conversationId
      ) {
        try {
          // Vérifier si l'utilisateur fait partie de la conversation
          const conversation = await Conversation.findOne({
            where: {
              ID_Conversation: conversationId,
              [Op.or]: [{ ID_User1: userId }, { ID_User2: userId }],
            },
            attributes: [
              "ID_Conversation",
              "ID_User1",
              "ID_User2",
              "Confidentialite",
              "Dernier_message",
              "createdAt",
              "updatedAt",
            ],
          });

          if (!conversation) {
            console.log(
              "Conversation non trouvée ou utilisateur non autorisé."
            );
            return;
          }

          // Récupérer les messages de la conversation spécifiée
          const messages = await Message.findAll({
            where: { ID_Conversation: conversationId },
            include: [
              {
                model: Utilisateur,
                as: "Utilisateur",
                attributes: ["Nom", "Prenom", "ID_User"],
              },
            ],
            order: [["Date_et_heure", "ASC"]],
          });

          // Préparer les messages pour l'envoi
          const messagesForClient = messages.map((message) => ({
            ...message.get({ plain: true }),
            isSentByCurrentUser: message.Utilisateur.ID_User === userId,
          }));

          // Envoyer les messages via WebSocket
          if (clients[userId]) {
            clients[userId].send(
              JSON.stringify({
                type: "historiqueMessages",
                conversationId: conversationId,
                messages: messagesForClient,
              })
            );
          }
          console.log(
            `Historique des messages envoyé pour la conversation ${conversationId}`
          );
          console.log(
            `Messages pour le client historique :`,
            messagesForClient
          );
          console.log("clients histoirque", clients);
        } catch (error) {
          console.error(
            `Erreur lors de l'envoi de l'historique des messages : ${error.message}`
          );
        }
      }

      async function envoyerHistoriqueMessagesPourGroupe(userId, groupId) {
        try {
          // Vérifier si l'utilisateur fait partie du groupe
          const isMember = await checkGroupMembership(userId, groupId);
          if (!isMember) {
            throw new Error("L'utilisateur n'est pas membre du groupe");
          }
          // Récupérer les messages du groupe spécifié
          const messages = await MessageGroupe.findAll({
            where: { ID_Groupe: groupId },
            include: [
              {
                model: Utilisateur,
                as: "Utilisateur",
                attributes: ["Nom", "Prenom", "ID_User"],
              },
            ],
            order: [["Date_et_heure", "ASC"]],
          });
          // Préparer les messages pour l'envoi
          const messagesForClient = messages.map((message) => ({
            ...message.get({ plain: true }),
            isSentByCurrentUser: message.Utilisateur.ID_User === userId,
          }));
          // Envoyer les messages via WebSocket
          if (clients[userId]) {
            clients[userId].send(
              JSON.stringify({
                type: "historiqueMessagesGroupe",
                groupId: groupId,
                messages: messagesForClient,
              })
            );
          }
        } catch (error) {
          console.error(
            `Erreur lors de l'envoi de l'historique des messages : ${error.message}`
          );
        }
      }

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

    // async function envoyerHistoriqueMessagesPourGroupe(userId, groupId) {
    //   try {
    //     // Vérifier si l'utilisateur est membre du groupe
    //     const membreGroupe = await MembreGroupe.findOne({
    //       where: { ID_User: userId, ID_Groupe: groupId },
    //     });

    //     if (!membreGroupe) {
    //       console.log(
    //         `L'utilisateur ${userId} n'est pas membre du groupe ${groupId}`
    //       );
    //       return;
    //     }

    //     // Récupérer les messages du groupe
    //     const messages = await MessageGroupe.findAll({
    //       where: { ID_Groupe: groupId },
    //       include: [
    //         {
    //           model: Utilisateur, // Assurez-vous que le modèle Utilisateur est importé
    //           as: "Utilisateur", // Alias défini dans l'association
    //           attributes: ["ID_User", "Nom", "Prenom"], // Champs à inclure
    //         },
    //       ],
    //       order: [["Date_et_heure", "ASC"]],
    //     });

    //     const messagesForClient = messages.map((message) => ({
    //       id: message.ID_Message,
    //       contenu: message.Contenu_du_message,
    //       groupeId: message.ID_Groupe,
    //       expediteur: {
    //         id: message.Utilisateur.ID_User,
    //         nom: message.Utilisateur.Nom,
    //         prenom: message.Utilisateur.Prenom,
    //       },
    //       dateEtHeure: message.Date_et_heure,
    //       statut: message.Statut_du_message,
    //     }));

    //     // Envoyer l'historique des messages au client via WebSocket
    //     if (clients[userId] && clients[userId].readyState === WebSocket.OPEN) {
    //       clients[userId].send(
    //         JSON.stringify({
    //           type: "historiqueMessagesGroupe",
    //           groupeId: groupId,
    //           messages: messagesForClient,
    //         })
    //       );
    //     }
    //   } catch (error) {
    //     console.error(
    //       `Erreur lors de l'envoi de l'historique des messages pour le groupe ${groupId}:`,
    //       error
    //     );
    //   }
    // }

    function handleNewMessage(
      senderId,
      recipientId,
      conversationId,
      content,
      userId
    ) {
      storeMessage(conversationId, senderId, content)
        .then(async (savedMessage) => {
          // Assurez-vous que savedMessageData est correctement défini
          const savedMessageData = savedMessage.get({ plain: true });

          const utilisateur = await Utilisateur.findByPk(senderId);

          console.log(
            "Comparaison pour isSentByCurrentUser:",
            "ID_User du message:",
            savedMessageData.ID_User,
            "userId:",
            userId,
            "senderId:",
            senderId
          );
          // Ensuite, utilisez savedMessageData dans la structure du message
          const messageForClient = {
            ...savedMessageData,
            Utilisateur: {
              Nom: utilisateur.Nom,
              Prenom: utilisateur.Prenom,
              ID_User: utilisateur.ID_User,
            },
            isSentByCurrentUser: savedMessageData.ID_User === senderId,
          };

          const messageToSend = {
            type: "newMessage",
            data: {
              conversationId: conversationId,
              messages: [messageForClient], // Un seul message dans un tableau
            },
          };

          // Envoi du message à l'expéditeur (confirmation) et au destinataire si connecté
          // [senderId, recipientId].forEach((id) => {
          //   if (clients[id]) {
          //     clients[id].send(JSON.stringify(messageToSend));
          //   }
          // });
          [senderId, recipientId].forEach((id) => {
            if (clients[id]) {
              // Définissez isSentByCurrentUser en fonction de si l'ID actuel est celui de l'expéditeur
              const isSender = id === senderId;
              const messageForCurrentClient = {
                ...messageForClient,
                isSentByCurrentUser: isSender
              };
          
              const messageToSend = {
                type: "newMessage",
                data: {
                  conversationId: conversationId,
                  messages: [messageForCurrentClient] // Un seul message dans un tableau
                },
              };
          
              clients[id].send(JSON.stringify(messageToSend));
            }
          });

          console.log(`Messages pour le client historique new message  :`, [
            messageForClient,
          ]);
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

    async function handleNewGroupMessage(senderId, groupId, content) {
      try {
        // Vérifiez si l'utilisateur fait partie du groupe
        const isMember = await checkGroupMembership(senderId, groupId);
        if (!isMember) {
          throw new Error("L'utilisateur n'est pas membre du groupe");
        }

        // Enregistrez le message dans la base de données
        const savedMessage = await storeGroupMessage(
          groupId,
          senderId,
          content
        );

        // Préparez le message pour l'envoi aux membres du groupe
        const messageForClients = prepareGroupMessage(savedMessage, senderId);

        // Envoyez le message à tous les membres du groupe
        sendGroupMessageToMembers(groupId, messageForClients);

        console.log("Message de groupe envoyé avec succès");
      } catch (error) {
        console.error("Erreur lors de l'envoi du message de groupe:", error);
      }
    }

    async function checkGroupMembership(userId, groupId) {
      try {
        const groupMember = await MembreGroupe.findOne({
          where: { ID_User: userId, ID_Groupe: groupId },
        });
        return !!groupMember; // Renvoie true si l'utilisateur est membre, sinon false
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'appartenance au groupe:",
          error
        );
        return false; // ou gérer l'erreur de manière appropriée
      }
    }

    async function storeGroupMessage(groupId, userId, content) {
      // Utilisation de votre modèle 'MessageGroupe'
      const message = await MessageGroupe.create({
        ID_Groupe: groupId,
        ID_User: userId,
        Contenu_du_message: content,
        Date_et_heure: new Date(),
        Statut_du_message: "Envoyé", // ou tout autre statut initial approprié
      });
      return message; // Renvoie le message enregistré
    }

    function prepareGroupMessage(message, senderId) {
      return {
        ...message.get({ plain: true }),
        isSentByCurrentUser: message.ID_User === senderId,
      };
    }
    function sendGroupMessageToMembers(groupId, message) {
      // Utilisation de votre modèle 'MembreGroupe' pour trouver tous les membres du groupe
      MembreGroupe.findAll({ where: { ID_Groupe: groupId } })
        .then((members) => {
          members.forEach((member) => {
            // Accéder au WebSocket client pour chaque membre du groupe
            const ws = clients[member.ID_User]; // Utilisez 'ID_User' pour identifier les membres
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "groupMessage",
                  data: message,
                })
              );
            }
          });
        })
        .catch((error) =>
          console.error("Erreur lors de l'envoi du message de groupe:", error)
        );
    }
  });
};
