// new-auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewAuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);

  

  private apiUrl = 'https://192.168.199.129:3443/api/users';
  constructor(private http: HttpClient) {}
  

  register(Nom: string, Prenom: string, Email: string, hashedPassword: string): Observable<any> {
    const body = {
      Nom,
      Prenom,
      Email,
      hashedPassword
    };

    // return this.http.post(`${this.apiUrl}/register`, body);
    return this.http.post(`${this.apiUrl}/register`, body, { withCredentials: true });
  }

  setSecurityQuestion(Question_securite: string, Reponse_securite: string): Observable<any> {
    const body = {
      Question_securite,
      Reponse_securite
    };
  
    return this.http.post(`${this.apiUrl}/set-security`, body, { withCredentials: true });
  }
  

login(Email: string, hashedPassword: string): Observable<any> {
    const body = {
      Email,
      hashedPassword
    };

    // return this.http.post(`${this.apiUrl}/login`, body);
    // return this.http.post(`${this.apiUrl}/login`, body, { withCredentials: true });

    return this.http.post(`${this.apiUrl}/login`, body, { withCredentials: true }).pipe(
      map(response => {
        this.setLoggedIn(true); // Mettre à jour l'état de connexion
        return response;
      }),
      catchError(error => {
        // Gérer l'erreur
        return of(error);
      })
    );
}

isUserLoggedIn(): Observable<boolean> {
  return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
    map(response => {
      // Si la réponse est réussie, on considère que l'utilisateur est connecté
      return true;
    }),
    catchError((error: HttpErrorResponse) => {
      // En cas d'erreur (par exemple, si le statut est 401 ou 403), on considère que l'utilisateur n'est pas connecté
      return of(false);
    })
  );
}


  // Méthode pour mettre à jour l'état de connexion
  setLoggedIn(value: boolean) {
    this.loggedIn.next(value);
  }

  // Observable à utiliser par les composants pour recevoir des mises à jour de l'état de connexion
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }
logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
    map(response => {
      this.setLoggedIn(false); // Mettre à jour l'état de déconnexion
      return response;
    })
  );
}



updateUser(Nom: string, Prenom: string, hashedPassword: string, currentPassword: string): Observable<any> {
  const body = {
      Nom,
      Prenom,
      hashedPassword,
      currentPassword
  };

  return this.http.put(`${this.apiUrl}/update`, body, { withCredentials: true });
}

requestPasswordReset(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/reset-password-request`, { email }, { withCredentials: true });
}

confirmPasswordReset(email: string, answer: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/reset-password`, { email, answer, newPassword }, { withCredentials: true });
}

getUserInfo(): Observable<any> {
  return this.http.get(`${this.apiUrl}/me`, { withCredentials: true });
}
updateUserInfo(nom: string, prenom: string, currentPassword: string): Observable<any> {
  const body = { Nom: nom, Prenom: prenom, currentPassword: currentPassword };
  return this.http.put(`${this.apiUrl}/update`, body, { withCredentials: true });
}

updateUserStatus(status: string): Observable<any> {
  const body = { status };
  return this.http.put(`${this.apiUrl}/set-status`, body, { withCredentials: true });
}
changePassword(oldPassword: string, newPassword: string): Observable<any> {
  const body = { oldPassword, newPassword };
  return this.http.put(`${this.apiUrl}/change-password`, body, { withCredentials: true });
}
updateSecurityQuestion(question: string, answer: string): Observable<any> {
  const body = { Question_securite: question, Reponse_securite: answer };
  return this.http.put(`${this.apiUrl}/update-security`, body, { withCredentials: true });
}


  // Méthode pour gérer la réponse de déconnexion
  handleLogoutResponse(): void {
    localStorage.removeItem('userToken');
  }
  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-profile-image`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

}
