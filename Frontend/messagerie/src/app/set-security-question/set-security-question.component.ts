// set-security-question.component.ts


import { Component } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-set-security-question',
  templateUrl: './set-security-question.component.html',
  styleUrls: ['./set-security-question.component.scss']
})
export class SetSecurityQuestionComponent {
  securityQuestions = [
    "Quel est le nom de votre premier animal de compagnie ?",
    "Dans quelle ville avez-vous grandi ?",
    "Quel est le prénom de votre meilleur ami d'enfance ?",
    // ... ajoutez d'autres questions ici
  ];
  
  selectedQuestion!: string;
  securityAnswer!: string;

  showNotification = false;
  notificationMessage = '';
  notificationType = ''; // 'success' or 'error'

  constructor(
    private newAuthService: NewAuthService,
    private router: Router ) {}

  submitSecurityQuestion() {
    this.newAuthService.setSecurityQuestion(this.selectedQuestion, this.securityAnswer).subscribe(
      response => {
        this.notificationMessage = "Question de sécurité définie avec succès!";
        this.notificationType = 'success';
        this.showNotification = true;
        this.router.navigate(['/home']);
      },
      error => {
        this.notificationMessage = "Erreur lors de la définition de la question de sécurité.";
        this.notificationType = 'error';
        this.showNotification = true;
      }
    );
  }
}
