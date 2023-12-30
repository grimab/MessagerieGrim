// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewAuthService } from './services/new-auth.service'; // Assurez-vous d'importer votre service d'authentification

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private NewAuthService: NewAuthService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.NewAuthService.isUserLoggedIn().pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']); // Remplacez '/login' par le chemin de votre page de connexion
          return false;
        }
        return true;
      })
    );
  }
}
