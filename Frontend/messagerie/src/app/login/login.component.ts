

// login.component.ts
import { Component } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { WebSocketService } from '../services/web-socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string | null = null;
  public isPasswordVisible: boolean = false;

  constructor(
    private router: Router, 
    private newAuthService: NewAuthService,
    private webSocketService: WebSocketService
  ) {}

  togglePasswordVisibility() {  
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit(form: any) {
    const { Email, hashedPassword } = form;

    this.newAuthService.login(Email, hashedPassword).subscribe((response: any) => {
      if (response.success) {
        this.router.navigate(['/home']);
        // Store the webSocketToken in the localStorage
        localStorage.setItem('webSocketToken', response.webSocketToken);
        // Connect to the WebSocket
        this.webSocketService.connect(response.webSocketToken);
      }
    }, (error: any) => {
      this.errorMessage = error.error?.error?.message || "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
    });
  }
}
