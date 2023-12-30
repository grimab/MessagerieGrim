// 
import { Component } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  showSecurityQuestion = false;
  securityQuestion: string = '';
  private userEmail: string = ''; // Pour stocker l'email de l'utilisateur
  router: any;

  constructor(private newAuthService: NewAuthService, private cdr: ChangeDetectorRef) {}

  // onRequestReset(data: any) {
  //   this.newAuthService.requestPasswordReset(data.Email).subscribe(response => {
  //     this.securityQuestion = response.question;
  //     this.showSecurityQuestion = true;
  //     this.cdr.detectChanges();  // Force la détection de changements
  //   });
  // }
// Dans reset-password.component.ts
onRequestReset(data: any) {
  this.userEmail = data.Email;
  this.newAuthService.requestPasswordReset(data.Email).subscribe(response => {
    this.securityQuestion = response.question;
    this.showSecurityQuestion = true;
    this.cdr.detectChanges();
  });
}


  onConfirmReset(data: any) {

    // const { answer, newPassword, confirmPassword } = data;
    const confirmPassword = data.confirmPassword;
    const newPassword = data.newPassword; // Declare the newPassword variable
    const answer = data.answer; // Declare the answer variable
    const email = this.userEmail; // Declare the email variable
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas!");
      return;
    }

    this.newAuthService.confirmPasswordReset(email, answer, newPassword).subscribe(response => {
      alert("Mot de passe réinitialisé avec succès!");

      // Rediriger l'utilisateur vers la page d'accueil
      if (response.success) {
        this.router.navigate(['/home']);
        // this.webSocketService.connect(response.webSocketToken);
      }

    }, error => {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    });
  }
}
