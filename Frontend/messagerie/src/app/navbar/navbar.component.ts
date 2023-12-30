// // NavbarComponent.ts

// import { Component, OnInit } from '@angular/core';
// import { NewAuthService } from '../services/new-auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.scss']
// })
// export class NavbarComponent implements OnInit {
//   isLoggedIn = false;

//   constructor(private authService: NewAuthService, private router: Router) {}

//   ngOnInit() {
//     this.isLoggedIn = this.authService.isUserLoggedIn();
//   }

//   logout() {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.authService.handleLogoutResponse();
//         this.isLoggedIn = false;
//         this.router.navigate(['/login']);
//       },
//       error: (err) => {
//         console.error('Erreur lors de la déconnexion', err);
//       }
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { NewAuthService } from '../services/new-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: NewAuthService, private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.authService.isLoggedIn.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
  }

  checkLoginStatus() {
    this.authService.isUserLoggedIn().subscribe({
      next: (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du statut de connexion', err);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.handleLogoutResponse();
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion', err);
      }
    });
  }
}
