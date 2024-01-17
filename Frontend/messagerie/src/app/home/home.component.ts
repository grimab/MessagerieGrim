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

  showGroupCreationForm = false;
  newGroupName = '';
  newGroupDescription = '';
  selectedGroupMembers = new Set<number>();

  showEditGroupForm = false;
  editGroupName = '';
  editGroupDescription = '';
  editingGroup: any;

  groupMembers: any[] = []; // Remplacez 'any' par le type approprié
  selectedMembersToRemove: Set<number> = new Set();
  selectedMembersToPromote: Set<number> = new Set();
  selectedMembersToAdd: Set<number> = new Set();
  selectedGroup: any = null; // Remplacer 'any' par le type approprié pour votre groupe
  selectedGroupMessages: any[] = [];
  messagesSubject: any;

  constructor(
    private contactService: ContactService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadMyFriends();
    this.loadMyGroups();

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

        // case 'newGroupMessage':
        // case 'groupMessage':
        //   if (
        //     this.selectedGroup &&
        //     data.groupId === this.selectedGroup.ID_Groupe
        //   ) {
        //     const newMessages = data.messages as any[]; // Utilisez le type approprié à la place de 'any' si possible
        //     newMessages.forEach((msg: any) => {
        //       // Ou remplacez 'any' par le type de message approprié
        //       const newMsg = {
        //         ...msg,
        //       };
        //       this.selectedGroupMessages.push(newMsg);
        //     });
        //     console.log('Nouveaux messages ajoutés:', newMessages);
        //   }
        //   break;

        case 'groupMessage':
          if (
            this.selectedGroup &&
            data.groupId === this.selectedGroup.ID_Groupe
          ) {
            const newMessages = data.messages as any[]; // Utilisez le type approprié à la place de 'any' si possible
            newMessages.forEach((msg: any) => {
              // Vérifiez si le message n'est pas déjà dans la liste
              if (
                !this.selectedGroupMessages.some(
                  (m) => m.ID_Message === msg.ID_Message
                )
              ) {
                const newMsg = {
                  ...msg,
                };
                this.selectedGroupMessages.push(newMsg);
              }
            });
            console.log('Nouveaux messages ajoutés:', newMessages);
          }
          break;

        case 'historiqueMessagesGroupe':
          if (
            this.selectedGroup &&
            message.groupId === this.selectedGroup.ID_Groupe
          ) {
            if (Array.isArray(message.messages)) {
              this.selectedGroupMessages = message.messages;
              console.log(
                'Messages de groupe mis à jour:',
                this.selectedGroupMessages
              );
            } else {
              console.error(
                "message.messages n'est pas un tableau:",
                message.messages
              );
            }
          } else {
            console.error(
              'Données inattendues reçues ou groupe non sélectionné:',
              message
            );
          }
          break;

        // Autres cas, si nécessaire
      }
    });
  }

  sendMessage(): void {
    if (this.selectedConversation && this.newMessage.trim()) {
      // Utilisez la type assertion pour assurer à TypeScript que selectedConversation n'est pas null
      const selectedConv = this.selectedConversation as NonNullable<
        typeof this.selectedConversation
      >;

      this.webSocketService
        .ensureConnected()
        .then(() => {
          this.webSocketService.sendMessage(
            selectedConv.ID_Conversation,
            selectedConv.ID_User2, // Ou l'ID du destinataire approprié
            this.newMessage
          );
          this.newMessage = ''; // Réinitialiser le nouveau message
        })
        .catch((error) => {
          console.error(
            'Impossible de se connecter au WebSocket pour envoyer le message:',
            error
          );
          // Gérer l'erreur ici
          this.errorMessage = 'Impossible de se connecter au WebSocket.' + error;
        });
    } else {
      console.log('Aucune conversation sélectionnée ou message vide');
      this.errorMessage = 'Aucune conversation sélectionnée ou message vide';

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

        this.errorMessage = 'Erreur lors de la récupération des conversations';
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
        this.errorMessage = 'Erreur lors du chargement des amis';
      }
    );
  }

  selectIndividualMessages(): void {
    this.individualSelected = true;
    this.groupSelected = false;

    // Fermer les formulaires lors de la sélection des messages de groupe
    // this.showNewConversationForm = false;
    this.showGroupCreationForm = false;
    this.showEditGroupForm = false;
  }

  selectGroupMessages(): void {
    this.individualSelected = false;
    this.groupSelected = true;

    // Fermer les formulaires lors de la sélection des messages de groupe
    this.showNewConversationForm = false;
    // this.showGroupCreationForm = false;
    this.showEditGroupForm = false;
  }

  openNewConversationForm(): void {
    this.showNewConversationForm = true;
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;

    // Utilisez la méthode ensureConnected pour s'assurer que le WebSocket est connecté
    this.webSocketService
      .ensureConnected()
      .then(() => {
        // Une fois connecté, envoyez la demande d'historique des messages
        this.webSocketService.send({
          type: 'demandeHistoriqueMessages',
          conversationId: conversation.ID_Conversation,
        });

        console.log('conversationId', conversation.ID_Conversation);
      })
      .catch((error) => {
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

  // gestion des groupe

  openGroupCreationForm(): void {
    this.showGroupCreationForm = true;
  }

  toggleGroupMember(memberId: number): void {
    if (this.selectedGroupMembers.has(memberId)) {
      this.selectedGroupMembers.delete(memberId);
    } else {
      this.selectedGroupMembers.add(memberId);
    }
  }

  // create marche
  createGroup(): void {
    const groupData = {
      Nom: this.newGroupName,
      Description: this.newGroupDescription,
      Membres: Array.from(this.selectedGroupMembers),
    };

    // Appelez votre service pour créer un groupe
    this.contactService.createGroup(groupData).subscribe(
      (response) => {
        // Traitez la réponse
        this.showGroupCreationForm = false;
        this.loadMyGroups(); // Rechargez les groupes après la création
      },
      (error) => {
        // Gérez les erreurs
      }
    );
  }

  loadMyGroups(): void {
    this.contactService.getGroups().subscribe(
      (groupes) => {
        // console.log(groupes);
        // console.log('afichage des groupe de conversation groupes', groupes);
        this.groupConversations = groupes.groupes;
        // console.log(' groupConversation', this.groupConversations); // Ajoutez ceci pour vérifier
      },
      (error) => {
        // Gérez les erreurs
      }
    );
  }

  selectGroupConversation(group: any): void {
    this.selectedGroup = group;
    this.groupSelected = true;
    this.individualSelected = false;

    // Ici, envoyez une requête pour obtenir les messages du groupe
    this.webSocketService
      .ensureConnected()
      .then(() => {
        this.webSocketService.send({
          type: 'demandeHistoriqueMessagesGroupe',
          groupId: group.ID_Groupe,
        });
      })
      .catch((error) => {
        console.error('Impossible de se connecter au WebSocket:', error);
      });
  }

  // selectGroupConversation(group: any): void {
  //   this.selectedGroup = group;
  //   this.groupSelected = true;
  //   this.individualSelected = false;

  //   // Réinitialiser les messages du groupe précédent
  //   this.selectedGroupMessages = [];

  //   // Envoyer une requête pour obtenir les messages du groupe sélectionné
  //   this.webSocketService
  //     .ensureConnected()
  //     .then(() => {
  //       this.webSocketService.send({
  //         type: 'demandeHistoriqueMessagesGroupe',
  //         groupId: group.ID_Groupe,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error('Impossible de se connecter au WebSocket:', error);
  //     });
  // }

  sendGroupMessage(): void {
    if (this.selectedGroup && this.newMessage.trim()) {
      // Créez un objet message avec les informations nécessaires
      const messageToSend = {
        // ID_Message, ID_Groupe, Contenu_du_message, etc.
        Contenu_du_message: this.newMessage,
        ID_Groupe: this.selectedGroup.ID_Groupe,
        // D'autres propriétés nécessaires comme l'expéditeur, l'heure, etc.
      };

      // Ajoutez le message à la liste des messages de groupe affichés
      this.selectedGroupMessages.push(messageToSend);

      // Ensuite, envoyez le message au serveur
      this.webSocketService
        .ensureConnected()
        .then(() => {
          this.webSocketService.sendGroupMessage(
            this.selectedGroup.ID_Groupe,
            this.newMessage
          );
          this.newMessage = ''; // Réinitialiser le champ de saisie du message
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi du message de groupe:", error);
        });
    } else {
      console.log('Aucun groupe sélectionné ou message vide');
    }
  }

  // sendGroupMessage(): void {
  //   if (this.selectedGroup && this.newMessage.trim()) {
  //     this.webSocketService
  //       .ensureConnected()
  //       .then(() => {
  //         this.webSocketService.sendGroupMessage(
  //           this.selectedGroup.ID_Groupe,
  //           this.newMessage
  //         );
  //         this.newMessage = ''; // Réinitialiser le champ de saisie du message
  //       })
  //       .catch((error) => {
  //         console.error("Erreur lors de l'envoi du message de groupe:", error);
  //       });
  //   } else {
  //     console.log('Aucun groupe sélectionné ou message vide');
  //   }
  // }

  // trackByFn(index: number, item: any): any {
  //   return item.ID_Message; // ou une autre propriété unique
  // }

  // delete marche
  deleteGroup(ID_Group: number): void {
    const confirmation = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.'
    );

    if (confirmation) {
      this.contactService.deleteGroup(ID_Group).subscribe(
        (response) => {
          // Gérer la réponse
          this.loadMyGroups(); // Recharger la liste après la suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression du groupe', error);
        }
      );
    }
  }

  // Méthode pour ouvrir le formulaire de modification avec les données préremplies
  openEditGroupForm(group: any): void {
    this.editingGroup = group;
    this.editGroupName = group.Nom_du_groupe;
    this.editGroupDescription = group.Description_du_groupe;
    this.showEditGroupForm = true;

    // Récupérer les membres du groupe
    this.getGroupMembers(group.ID_Groupe);
  }

  getFriendsNotInGroup(): any[] {
    if (!this.groupMembers) {
      return this.friends;
    }

    const groupMemberIds = new Set(
      this.groupMembers.map((member) => member.Utilisateur.ID_User)
    );
    return this.friends.filter((friend) => !groupMemberIds.has(friend.ID_User));
  }

  getGroupMembers(ID_Groupe: number): void {
    this.contactService.getGroupMembers(ID_Groupe).subscribe(
      (response) => {
        if (response.success && Array.isArray(response.membres)) {
          this.groupMembers = response.membres;
        } else {
          console.error('Format de données inattendu:', response);
          this.groupMembers = []; // Réinitialiser pour éviter les erreurs
        }
      },
      (error) =>
        console.error(
          'Erreur lors de la récupération des membres du groupe:',
          error
        )
    );
  }

  // Méthode pour annuler la modification et fermer le formulaire
  cancelEdit(): void {
    this.showEditGroupForm = false;
    this.editingGroup = null;
  }

  // Ajoutez les méthodes pour gérer les sélections des membres à retirer et à promouvoir

  toggleMemberToRemove(memberId: number): void {
    if (this.selectedMembersToRemove.has(memberId)) {
      this.selectedMembersToRemove.delete(memberId);
    } else {
      this.selectedMembersToRemove.add(memberId);
    }
  }

  toggleMemberToPromote(memberId: number): void {
    if (this.selectedMembersToPromote.has(memberId)) {
      this.selectedMembersToPromote.delete(memberId);
    } else {
      this.selectedMembersToPromote.add(memberId);
    }
  }

  toggleMemberToAdd(memberId: number): void {
    if (this.selectedMembersToAdd.has(memberId)) {
      this.selectedMembersToAdd.delete(memberId);
    } else {
      this.selectedMembersToAdd.add(memberId);
    }
  }

  // Méthode pour soumettre les modifications du groupe
  updateGroup(): void {
    const updatedGroupData = {
      ID_Groupe: this.editingGroup.ID_Groupe,
      NouveauNom: this.editGroupName,
      NouvelleDescription: this.editGroupDescription,
      MembresAAjouter: Array.from(this.selectedMembersToAdd),
      MembresARetirer: Array.from(this.selectedMembersToRemove),
      NouveauxAdmins: Array.from(this.selectedMembersToPromote),
    };

    this.contactService.updateGroup(updatedGroupData).subscribe(
      (response) => {
        // Gérer la réponse
        this.showEditGroupForm = false;
        this.loadMyGroups(); // Recharger les groupes après la mise à jour
      },
      (error) => {
        // Gérer les erreurs
        console.error('Erreur lors de la mise à jour du groupe:', error);
      }
    );
  }
}
