import { Component } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-register',
  templateUrl: './new-register.component.html',
  styleUrls: ['./new-register.component.scss']
})

export class NewRegisterComponent {
  errorMessage: string | null = null;
  hashedPassword: string = '';
  confirmPassword: string = '';

  passwordsMatch(): boolean {
      return this.hashedPassword === this.confirmPassword;
  }
 
  constructor(private router: Router, private newAuthService: NewAuthService) { }


  onSubmit(form: any) {
    const { Nom, Prenom, Email, hashedPassword } = form;
    console.log("Données envoyées:", {Nom, Prenom, Email, hashedPassword});

    this.newAuthService.register(Nom, Prenom, Email, hashedPassword).subscribe((response: any) => {
        console.log("Réponse reçue:", response);

        // Si l'inscription est réussie, rediriger l'utilisateur .
        // Par exemple :
        if (response.success) {
          alert('Vous êtes maintenant connecté!');
          // this.router.navigate(['/home']);
          this.router.navigate(['/set-security-question']);

      }
      
    }, (error: any) => {
        console.log("Erreur complète:", error);
        this.errorMessage = error.error?.error?.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
        alert(this.errorMessage);
    });
  }
}
