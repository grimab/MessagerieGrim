
import { Component, OnInit } from '@angular/core';
import { ContactService } from '../services/contact.service'; // Assurez-vous que le chemin est correct


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  allUsers: any[] = [];
  myFriends: any[] = [];
  message: string = '';
  blockedUsers: any[] = [];
  pendingRequests: any[] = [];

  selectedTab: string = 'friends'; // Défaut à 'friends'

  selectTab(tab: string) {
    this.selectedTab = tab;
  }


  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadAllUsers();
    this.loadMyFriends();
    this.loadMyBlockedContacts();
    this.loadPendingRequests();
  }



  loadAllUsers() {
    this.contactService.getAllUsers().subscribe(
      users => {
        this.allUsers = users;
        console.log(this.allUsers); // Ajoutez cette ligne pour déboguer
      },
      error => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.message = 'Erreur lors du chargement des utilisateurs';
      }
    );
  }
  

  loadMyFriends() {
    this.contactService.getMyFriends().subscribe(
      friends => this.myFriends = friends, // les amis sont maintenant des objets UtilisateurContact
      error => {
        console.error('Erreur lors du chargement des amis', error);
        this.message = 'Erreur lors du chargement des amis';
      }
    );
  }
  loadMyBlockedContacts() {
    this.contactService.getMyBlockedContacts().subscribe(
      blocked => this.blockedUsers = blocked, // Changez myFriends en blockedUsers
      error => {
        console.error('Erreur lors du chargement des contacts bloqués', error);
        this.message = 'Erreur lors du chargement des contacts bloqués';
      }
    );
  }
  
  
   // Méthode pour charger les demandes de contact en attente
   loadPendingRequests() {
    this.contactService.getPendingRequests().subscribe(
      requests => {
        this.pendingRequests = requests;
      },
      error => {
        console.error('Erreur lors du chargement des demandes en attente', error);
        this.message = 'Erreur lors du chargement des demandes en attente';
      }
    );
  }

    // Méthode pour accepter une demande de contact
    acceptContactRequest(userId: number) {
      this.contactService.acceptContactRequest(userId).subscribe(
        response => {
          this.message = 'Demande de contact acceptée avec succès';
          this.loadPendingRequests();
          this.loadMyFriends();
          this.loadMyBlockedContacts();
          this.loadAllUsers();

          // Recharger d'autres listes si nécessaire
        },
        error => {
          console.error('Erreur lors de l\'acceptation de la demande de contact', error);
          this.message = 'Erreur lors de l\'acceptation de la demande de contact';
        }
      );
    }
  

  
  addFriend(userId: number) {
    console.log('contenu de userId : ' + userId);
    this.contactService.addFriend(userId).subscribe(
      response => {
        this.message = 'Demande d\'ami envoyée avec succès';
        this.loadAllUsers();
        this.loadMyFriends();
        this.loadMyBlockedContacts();
        this.loadPendingRequests();
      },
      error => {
        console.error('Erreur lors de l\'ajout d\'un ami', error);
        this.message = 'Erreur lors de l\'ajout d\'un ami';
      }
    );
  }
  
  removeFriend(userId: number) {
    this.contactService.removeFriend(userId).subscribe(
      response => {
        this.message = 'Ami supprimé avec succès';
        this.loadAllUsers();
        this.loadMyFriends();
        this.loadMyBlockedContacts();
        this.loadPendingRequests();
      },
      error => {
        console.error('Erreur lors de la suppression d\'un ami', error);
        this.message = 'Erreur lors de la suppression d\'un ami';
      }
    );
  }
  
  blockContact(userId: number) {
    this.contactService.blockContact(userId).subscribe(
      response => {
        this.message = 'Contact bloqué avec succès';
        this.loadAllUsers();
        this.loadMyFriends();
        this.loadMyBlockedContacts();
        this.loadPendingRequests();
        
      },
      error => {
        console.error('Erreur lors du blocage d\'un contact', error);
        this.message = 'Erreur lors du blocage d\'un contact';
      }

    );
  }
  

}
