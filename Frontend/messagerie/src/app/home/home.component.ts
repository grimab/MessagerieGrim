// home.component.ts

import { Component, OnInit } from '@angular/core';
import { ContactService } from '../services/contact.service';
import { WebSocketService } from '../services/web-socket.service';

interface User {
  Nom: string;
  Prenom: string;
}

interface Conversation {
  ID_Conversation: number;
  ID_User1: number;
  ID_User2: number;
  Confidentialite: boolean;
  Dernier_message: string | null;
  createdAt: string;
  updatedAt: string;
  Utilisateur1: User;
  Utilisateur2: User;
}

interface Friend {
  id: number;
  Nom: string;
  Prenom: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  individualSelected: boolean = true;
  groupSelected: boolean = false;
  individualConversations: Conversation[] = [];
  groupConversations: any;
  showNewConversationForm = false;
  selectedFriendId: number | null = null;
  friends: any[] = []; // Typez cette liste selon votre modèle d'ami
  successMessage: string | null = null;
  errorMessage: string | null = null;
  selectedConversation: Conversation | null = null;
  selectedMessages: any[] = []; // Typez ceci en fonction de votre modèle de message
  newMessage: string = '';

  constructor(
    private contactService: ContactService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadMyFriends();

    this.webSocketService.onMessage().subscribe((message: any) => {
      console.log('Message reçu via WebSocket :', message);

      const { type, data, conversationId, messages } = message;

      switch (type) {
        case 'historiqueMessages':
          if (
            this.selectedConversation &&
            conversationId === this.selectedConversation.ID_Conversation
          ) {
            this.selectedMessages = messages.map((msg: any) => ({
              ...msg,
             
            }));
            console.log('Messages historiques chargés:', this.selectedMessages);
          }
          break;

        case 'newMessage':
          if (
            this.selectedConversation &&
            data.conversationId === this.selectedConversation.ID_Conversation
          ) {
            const newMessages = data.messages as any[]; // Utilisez le type approprié à la place de 'any' si possible
            newMessages.forEach((msg: any) => {
              // Ou remplacez 'any' par le type de message approprié
              const newMsg = {
                ...msg,
                
              };
              this.selectedMessages.push(newMsg);
            });
            console.log('Nouveaux messages ajoutés:', newMessages);
          }
          break;

        // case 'newMessage':
        //   if (
        //     this.selectedConversation &&
        //     data.conversationId === this.selectedConversation.ID_Conversation
        //   ) {
        //     const newMessages = data.messages as any[]; // Utilisez le type approprié à la place de 'any' si possible

        //     newMessages.forEach((msg: any) => {
        //       // Ou remplacez 'any' par le type de message approprié
        //       // Vérifiez si le message est déjà présent en utilisant l'ID du message
        //       if (
        //         !this.selectedMessages.some(
        //           (existingMsg) => existingMsg.ID_Message === msg.ID_Message
        //         )
        //       ) {
        //         const newMsg = {
        //           ...msg,
        //           isSentByCurrentUser:
        //             msg.ID_User === this.selectedConversation?.ID_User1, // Ajout du '?' pour éviter l'erreur si 'selectedConversation' est null
        //         };
        //         this.selectedMessages.push(newMsg);
        //       }
        //     });
        //     console.log('Nouveaux messages ajoutés:', newMessages);
        //   }
        //   break;

        // Autres cas, si nécessaire
      }
    });
  }

  // Autres méthodes et propriétés de la classe...

  // sendMessage(): void {
  //   if (this.selectedConversation && this.newMessage.trim()) {
  //     // Ici, utilisez la méthode correcte de WebSocketService pour envoyer le message
  //     this.webSocketService.sendMessage(
  //       this.selectedConversation.ID_Conversation,
  //       this.selectedConversation.ID_User2, // Ou l'ID du destinataire approprié
  //       this.newMessage
  //     );
  //     this.newMessage = '';
  //     // Après l'envoi du message, rechargez les messages si vous le souhaitez
  //   }
  // }


  sendMessage(): void {
    if (this.selectedConversation && this.newMessage.trim()) {
      // Utilisez la type assertion pour assurer à TypeScript que selectedConversation n'est pas null
      const selectedConv = this.selectedConversation as NonNullable<typeof this.selectedConversation>;
  
      this.webSocketService.ensureConnected().then(() => {
        this.webSocketService.sendMessage(
          selectedConv.ID_Conversation,
          selectedConv.ID_User2, // Ou l'ID du destinataire approprié
          this.newMessage
        );
        this.newMessage = ''; // Réinitialiser le nouveau message
      }).catch(error => {
        console.error('Impossible de se connecter au WebSocket pour envoyer le message:', error);
        // Gérer l'erreur ici
      });
    } else {
      console.log('Aucune conversation sélectionnée ou message vide');
      // Gérer le cas où il n'y a pas de conversation sélectionnée ou le message est vide
    }
  }
  
  

  loadConversations(): void {
    this.contactService.getConversations().subscribe(
      (response) => {
        this.individualConversations = response.data;
      },
      (error) => {
        console.error(
          'Erreur lors de la récupération des conversations',
          error
        );
      }
    );
  }

  onSelectFriend(friendId: number): void {
    this.selectedFriendId = friendId;
    console.log('Ami sélectionné :', this.selectedFriendId);
  }

  trackByFn(index: number, item: any): any {
    return item.ID_Message; // ou une autre propriété unique
  }

  loadMyFriends(): void {
    this.contactService.getMyFriends().subscribe(
      (friends) => {
        this.friends = friends;
      },
      (error) => {
        console.error('Erreur lors du chargement des amis', error);
        // Gérer l'erreur comme vous le souhaitez
      }
    );
  }

  selectIndividualMessages(): void {
    this.individualSelected = true;
    this.groupSelected = false;
  }

  selectGroupMessages(): void {
    this.individualSelected = false;
    this.groupSelected = true;
  }

  openNewConversationForm(): void {
    this.showNewConversationForm = true;
  }

  // selectConversation(conversation: Conversation): void {
  //   this.selectedConversation = conversation;
  //   if (this.webSocketService.isConnected()) {
  //     this.webSocketService.send({
  //       type: 'demandeHistoriqueMessages',
  //       conversationId: conversation.ID_Conversation,
  //     });

  //     console.log('conversationId', conversation.ID_Conversation);
  //   }
  // }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
  
    // Utilisez la méthode ensureConnected pour s'assurer que le WebSocket est connecté
    this.webSocketService.ensureConnected().then(() => {
      // Une fois connecté, envoyez la demande d'historique des messages
      this.webSocketService.send({
        type: 'demandeHistoriqueMessages',
        conversationId: conversation.ID_Conversation,
      });
  
      console.log('conversationId', conversation.ID_Conversation);
    }).catch(error => {
      console.error('Impossible de se connecter au WebSocket:', error);
      // Gérer l'échec de connexion ici, par exemple, en informant l'utilisateur
    });
  }
  

  createNewConversation(): void {
    if (this.selectedFriendId) {
      this.contactService.createConversation(this.selectedFriendId).subscribe(
        (response) => {
          if (response.success) {
            // Si l'opération est réussie
            this.successMessage = 'Conversation créée avec succès.';
            this.errorMessage = null;
            this.showNewConversationForm = false;
            this.loadConversations();
          } else {
            // Si l'opération échoue, utilisez le message de l'API
            this.errorMessage = `Erreur : ${response.message}`;
            this.successMessage = null;
          }
          setTimeout(() => {
            this.successMessage = null;
            this.errorMessage = null;
          }, 3000);
        },
        (error) => {
          // Gestion des erreurs réseau ou serveur
          this.errorMessage =
            'Erreur lors de la communication avec le serveur.' + error.message;
          this.successMessage = null;
          setTimeout(() => (this.errorMessage = null), 30000);
        }
      );
    } else {
      this.errorMessage = 'Aucun ami sélectionné.';
      setTimeout(() => (this.errorMessage = null), 3000);
    }
  }

  deleteConversation(ID_Conversation: number): void {
    const confirmation = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.'
    );

    if (confirmation) {
      this.contactService.deleteConversation(ID_Conversation).subscribe(
        (response) => {
          // Gérer la réponse
          this.loadConversations(); // Recharger la liste après la suppression
        },
        (error) => {
          console.error(
            'Erreur lors de la suppression de la conversation',
            error
          );
        }
      );
    }
  }
}
