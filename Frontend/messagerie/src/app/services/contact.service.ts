
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://192.168.199.129:3443/api/contacts';
  private apiUrl2 = 'https://192.168.199.129:3443/api/conversations';

  constructor(private http: HttpClient) { }
// fait 
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { withCredentials: true })
      .pipe(map((response: any) => response.users));
  }
// fait 
getMyFriends(): Observable<any> {
  return this.http.get(`${this.apiUrl}/amies`, { withCredentials: true })
    .pipe(
      map((response: any) => response.contacts.map((contact: any) => contact.Ami))
    );
}

  
  getMyBlockedContacts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/block`, { withCredentials: true })
      .pipe(
        map((response: any) => response.contacts.map((contact: any) => contact.UtilisateurContact))
      );
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/invitation`, { withCredentials: true })
      .pipe(
        map((response: any) => response.pendingRequests.map((request: any) => request.UtilisateurPrincipal))
      );
  }
  

  addFriend(ID_Contact_User: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { ID_Contact_User }, { withCredentials: true });
  }
  
  removeFriend(ID_Contact_User: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove`, { body: { ID_Contact_User }, withCredentials: true });
  }
  
  blockContact(ID_Contact_User: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/status`, { ID_Contact_User }, { withCredentials: true });
  }
  

  acceptContactRequest(ID_Contact_User: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/accept`, { ID_Contact_User }, { withCredentials: true });
  }

  createConversation(ID_User2: number): Observable<any> {
    return this.http.post(`${this.apiUrl2}/create`, { ID_User2 }, { withCredentials: true });
  }
  

  getConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl2}/getAllConversation`, { withCredentials: true });
  }

  deleteConversation(ID_Conversation: number): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/delete`, { body: { ID_Conversation }, withCredentials: true });
  }

  // getMessages(ID_Conversation: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl2}/getMessages`, {
  //     params: { ID_Conversation: ID_Conversation.toString() },
  //     withCredentials: true
  //   });
  // }

  
}
