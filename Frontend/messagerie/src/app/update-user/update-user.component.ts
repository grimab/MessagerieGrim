// update-user.component.ts

import { Component } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent {
  user: any = {
    Nom: '',
    Prenom: '',
    Email: '',
    Statut: '',
    Image_de_profil: null,
    Date_de_derniere_connexion: null
  };
  errorMessage: string | null = null;

  hashedPassword: string = '';
  confirmPassword: string = '';
  selectedFile: File | null = null;
  currentPassword: string = ''; 

  securityQuestions = [
    "Quel est le nom de votre premier animal de compagnie ?",
    "Dans quelle ville avez-vous grandi ?",
    "Quel est le prénom de votre meilleur ami d'enfance ?",
    // ... ajoutez d'autres questions ici
  ];
  showUpdateInfoForm: boolean = false;
  showUpdateStatusForm: boolean = false;
  showChangePasswordForm: boolean = false;
  showUpdateSecurityQuestionForm: boolean = false;
  showDeleteAccountForm: boolean = false;

  toggleUpdateInfoForm() {
    this.showUpdateInfoForm = !this.showUpdateInfoForm;
  }

  toggleUpdateStatusForm() {
    this.showUpdateStatusForm = !this.showUpdateStatusForm;
  }

  toggleChangePasswordForm() {
    this.showChangePasswordForm = !this.showChangePasswordForm;
  }

  toggleUpdateSecurityQuestionForm() {
    this.showUpdateSecurityQuestionForm = !this.showUpdateSecurityQuestionForm;
  }

  toggleDeleteAccountForm() {
    // Implémenter la logique ici
    this.showDeleteAccountForm = !this.showDeleteAccountForm;
    
  }

  constructor(private authService: NewAuthService, private router: Router) {}

  onFileChange(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedFile = fileList[0];
      this.user.Image_de_profil = this.selectedFile; // Assuming you handle file preview in your user object
    }
  }

  passwordsMatch(): boolean {
    return this.hashedPassword === this.confirmPassword;
  }
  onProfileImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.uploadProfileImage(file);
    }
  }
  onUpdateInfo(form: any) {
    const { Nom, Prenom } = form;
  
    // Vous devez ajouter la logique pour récupérer le currentPassword
    // Assurez-vous que currentPassword est défini dans la classe du composant
    const currentPassword = this.user.currentPassword; 
  
    this.authService.updateUserInfo(Nom, Prenom, currentPassword).subscribe({
      next: (response) => {
        alert('Informations mises à jour avec succès!');
        // Redirection ou autres actions après la mise à jour
      },
      error: (error) => {
        this.errorMessage = error.error?.message || "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.";
      }
    });
  }
  
  
  onUpdateStatus(form: any) {
    const { Statut } = form;
    this.authService.updateUserStatus(Statut).subscribe({
      next: (response) => {
        // Gérer la réponse positive ici
        console.log('Statut mis à jour avec succès');
        alert('Statut mis à jour avec succès!');
      },
      error: (error) => {
        // Gérer les erreurs ici
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }
  
  onChangePassword(form: NgForm) {
    const { oldPassword, newPassword, confirmPassword } = form.value;
  
    if (newPassword !== confirmPassword) {
      // afficher un message d'erreur

      return;
    }
  
     this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: (response) => {
        // Gérer la réponse positive ici

        alert('Mot de passe mis à jour avec succès!');
      },
      error: (error) => {
        // Gérer les erreurs ici
        console.error('Erreur lors du changement de mot de passe:', error);
      }
    });
  }
  
  selectedQuestion: string = ''; // Declare the 'selectedQuestion' property

  onUpdateSecurityQuestion(form: NgForm) {
    if (form.valid) {
      this.authService.updateSecurityQuestion(this.selectedQuestion, form.value.securityAnswer).subscribe({
        next: (response) => console.log('Question de sécurité mise à jour'),
        error: (error) => console.error('Erreur lors de la mise à jour', error)
      });
    }
  }
  
uploadProfileImage(file: File): void {
    const formData = new FormData();
    formData.append('file', file);

    this.authService.uploadProfileImage(formData).subscribe({
      next: (response) => {
        // Traiter la réponse du serveur
        // Par exemple, stocker l'URL de l'image reçue dans le state du composant pour l'afficher
        this.user.Image_de_profil = response.imageUrl;
      },
      error: (error) => {
        // Gérer les erreurs de téléchargement ici
        console.error('Erreur lors du téléchargement de l\'image :', error);
      }
    });
}

  onDeleteAccount() {
    
    this.authService.deleteAccount().subscribe({
      next: (response) => {
        // Gérer la réponse positive ici
        alert('Compte supprimé avec succès!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        // Gérer les erreurs ici
        console.error('Erreur lors de la suppression du compte:', error);
      }
    });
  }


}
