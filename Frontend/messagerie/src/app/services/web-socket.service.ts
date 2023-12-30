// // web-socket.service.ts
// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class WebSocketService {
//   private webSocket!: WebSocket;
//   private webSocketState: 'connected' | 'disconnected' | 'connecting' =
//     'disconnected';
//   private messagesSubject = new Subject<string>();
//   public messages$ = this.messagesSubject.asObservable();

//   private reconnectAttempts = 0;

//   private reconnect() {
//     const maxAttempts = 5;
//     if (this.reconnectAttempts < maxAttempts) {
//       setTimeout(() => {
//         const webSocketToken = localStorage.getItem('webSocketToken');
//         if (webSocketToken) {
//           this.connect(webSocketToken);
//         }
//         this.reconnectAttempts++;
//       }, Math.pow(2, this.reconnectAttempts) * 1000); // Reconnexion exponentielle
//     } else {
//       console.error('Maximum reconnection attempts reached');
//     }
//   }

//   private updateWebSocketState(
//     state: 'connected' | 'disconnected' | 'connecting'
//   ) {
//     this.webSocketState = state;
//     console.log('WebSocket state:', this.webSocketState);
//   }
//   webSocketToken = localStorage.getItem('webSocketToken');

//   public connect(webSocketToken: string): void {
//     this.updateWebSocketState('connecting');
//     // recuperer le token du local storage
//     console.log('token', webSocketToken);

//     const url = `wss://192.168.199.129:3443/path?token=${webSocketToken}`;
//     this.webSocket = new WebSocket(url);

//     this.webSocket.onopen = () => {
//       console.log('WebSocket connection established');
//       this.updateWebSocketState('connected');
//     };

//     this.webSocket.onmessage = (message) => {
//       this.messagesSubject.next(message.data);
//     };

//     this.webSocket.onclose = (event) => {
//       console.log('WebSocket closed:', event);
//       this.updateWebSocketState('disconnected');
//       this.reconnect(); // Tentative de reconnexion
//     };

//     this.webSocket.onerror = (event) => {
//       console.error('WebSocket error:', event);
//       this.updateWebSocketState('disconnected');
//       this.reconnect(); // Tentative de reconnexion
//     };

//     //   public connect(): void {
//     //     // Assurez-vous que l'URL correspond à l'adresse de votre serveur WebSocket
//     //     const url = `wss://192.168.199.129:3443/path`;
//     //     console.log(`WebSocket URL: ${url}`);
//     //     this.webSocket = new WebSocket(url);

//     //     this.webSocket.onopen = () => {
//     //       console.log('WebSocket connection established');
//     //     };

//     //     this.webSocket.onmessage = (message) => {
//     //       // Gestion des messages reçus
//     //     };

//     //     this.webSocket.onclose = (event) => {
//     //       console.log('WebSocket closed:', event);
//     //     };

//     //     this.webSocket.onerror = (event) => {
//     //       console.error('WebSocket error:', event);
//     //     };
//     // }

//     // public onMessage(): Observable<any> {
//     //   return new Observable((observer: any) => {

//     //     this.webSocket.onmessage = (event) => {
//     //       const data = JSON.parse(event.data);
//     //       observer.next(data);
//     //     };
//     //   });
//   }

//   public onMessage(): Observable<any> {
//     return new Observable((observer) => {
     
//       this.webSocket.onmessage = (event) => {
//         console.log('Données brutes reçues:', event.data);
//         const data = JSON.parse(event.data);
//         console.log('Message reçu:', data);

//         switch (data.type) {
//           case 'historiqueMessages':
//             // Gérer l'historique des messages reçus
//             observer.next({
//               type: 'historiqueMessages',
//               conversationId: data.conversationId,
//               messages: data.messages,
//             });
//             break;

//           case 'newMessage':
//             // Gérer les nouveaux messages reçus
//             observer.next({ type: 'newMessage', message: data.message });
//             break;
//           case 'updateStatus':
//             // Gérer les nouveaux messages reçus
//             observer.next({ type: 'updateStatus', message: data.message });
//             break;
//           case 'historiqueMessages':
//             // Gérer les nouveaux messages reçus
//             observer.next({
//               type: 'historiqueMessages',
//               message: data.message,
//             });
//             break;

//           // Ajoutez ici des cas pour d'autres types de messages si nécessaire
//           // Par exemple, gestion des confirmations de lecture, notifications, etc.

//           default:
//             // Pour tout autre type de message non géré
//             console.warn('Type de message non reconnu:', data.type);
//             break;
//         }
//       };

//       // Gérer la fermeture et les erreurs de WebSocket
//       this.webSocket.onclose = (event) =>
//         console.log('WebSocket closed:', event);
//       this.webSocket.onerror = (event) =>
//         console.error('WebSocket error:', event);
//     });
//   }

//   public isConnected(): boolean {
//     return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
//   }

//   // Dans WebSocketService
//   // public sendMessage(conversationId: number, recipientId: number, content: string): void {
//   //   if (this.webSocket.readyState === WebSocket.OPEN) {
//   //       this.webSocket.send(JSON.stringify({
//   //           type: 'newMessage',
//   //           conversationId,
//   //           recipientId,
//   //           content
//   //       }));
//   //   } else {
//   //       console.error('WebSocket is not connected.');
//   //   }
//   // }

//   public sendMessage(
//     conversationId: number,
//     recipientId: number,
//     content: string
//   ): void {
//     if (this.webSocketState === 'connected' && this.webSocket) {
//       this.webSocket.send(
//         JSON.stringify({
//           type: 'newMessage',
//           conversationId,
//           recipientId,
//           content,
//         })
       

//       );
//     } else if (this.webSocketState === 'disconnected') {
//       console.error('WebSocket is not connected. Trying to reconnect...');
//       this.reconnect();

//       // Optionnel: Ajouter une tentative de renvoi du message après une reconnexion réussie.
//       // Cela peut être géré par une logique de callback ou d'événement.
//     } else {
//       console.error('WebSocket connection is in a pending state.');
//     }
//   }

//   // public send(message: any): void {
//   //   if (this.webSocket.readyState === WebSocket.OPEN) {
//   //     this.webSocket.send(JSON.stringify(message));
//   //   } else {
//   //     console.error('WebSocket is not connected.');
//   //   }
//   // }

//   public send(message: any): void {
//     if (this.webSocketState === 'connected' && this.webSocket) {
//       this.webSocket.send(JSON.stringify(message));
      
//     } else if (this.webSocketState === 'disconnected') {
//       console.error('WebSocket is not connected. Trying to reconnect...');
//       this.reconnect();

//       // Optionnel: Ajouter une tentative de renvoi du message après une reconnexion réussie.
//       // Cela peut être géré par une logique de callback ou d'événement.
//     } else {
//       console.error('WebSocket connection is in a pending state.');
//     }
//   }

//   // // Dans un service ou un composant Angular
//   // sendMessageStatusUpdate(conversationId: number, userId: number, newStatus: string) {
//   //   this.webSocket.send(JSON.stringify({
//   //       type: 'updateStatus',
//   //       conversationId,
//   //       userId,
//   //       newStatus
//   //   }));
//   // }

//   sendMessageStatusUpdate(
//     conversationId: number,
//     userId: number,
//     newStatus: string
//   ) {
//     if (this.webSocketState === 'connected' && this.webSocket) {
//       this.webSocket.send(
//         JSON.stringify({
//           type: 'updateStatus',
//           conversationId,
//           userId,
//           newStatus,
//         })
//       );
//     } else if (this.webSocketState === 'disconnected') {
//       console.error('WebSocket is not connected. Trying to reconnect...');
//       this.reconnect();

//       // Optionnel: Vous pouvez envisager d'ajouter une logique pour réessayer
//       // d'envoyer le message après une reconnexion réussie.
//     } else {
//       console.error('WebSocket connection is in a pending state.');
//     }
//   }

//   public close(): void {
//     if (this.webSocket) {
//       this.webSocket.close();
//     }
//   }
// }















///////////////////////////////////////////////////////////////////////////////:








// web-socket.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket?: WebSocket;
  private webSocketState: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  private reconnectAttempts = 0;

  // private reconnect() {
  //   const maxAttempts = 5;
  //   if (this.reconnectAttempts < maxAttempts) {
  //     setTimeout(() => {
  //       const webSocketToken = localStorage.getItem('webSocketToken');
  //       if (webSocketToken) {
  //         this.connect(webSocketToken);
  //         console.log('tentative de reconnexion', this.reconnectAttempts)
  //       }
  //       this.reconnectAttempts++;
  //     }, Math.pow(2, this.reconnectAttempts) * 1000); // Reconnexion exponentielle
  //   } else {
  //     console.error('Maximum reconnection attempts reached');
  //   }
  // }

  private reconnect() {
    const maxAttempts = 5;
    if (this.reconnectAttempts < maxAttempts) {
      setTimeout(() => {
        const webSocketToken = localStorage.getItem('webSocketToken');
        if (webSocketToken) {
          this.connect(webSocketToken);
          console.log('Tentative de reconnexion', this.reconnectAttempts);
        } else {
          console.error('WebSocket token not found in localStorage');
          // Traiter le cas où le token n'est pas trouvé
        }
        this.reconnectAttempts++;
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Reconnexion exponentielle
    } else {
      console.error('Nombre maximum de tentatives de reconnexion atteint');
      // Informer l'application que la reconnexion a échoué
      // Exécutez ici toute action nécessaire en cas d'échec répété de la reconnexion
    }
  }
  

  private updateWebSocketState(state: 'connected' | 'disconnected' | 'connecting') {
    this.webSocketState = state;
    console.log('WebSocket state:', this.webSocketState);
  }

  // public connect(webSocketToken: string): void {
  //   this.updateWebSocketState('connecting');
  //   const url = `wss://192.168.199.129:3443/path?token=${webSocketToken}`;
  //   this.webSocket = new WebSocket(url);

  //   this.webSocket.onopen = () => {
  //     console.log('WebSocket connection established');
  //     this.updateWebSocketState('connected');
  //   };

  //   this.webSocket.onmessage = (message) => {
  //     if (message.data) {
  //       const data = JSON.parse(message.data);
  //       console.log('Message reçu dasn onmessage:', data);
  //       this.messagesSubject.next(data);
  //     }
  //   };

  //   this.webSocket.onclose = (event) => {
  //     console.log('WebSocket closed:', event);
  //     console.log('disconeected on close1')
  //     this.updateWebSocketState('disconnected');
  //     this.reconnect(); // Tentative de reconnexion
  //   };

  //   this.webSocket.onerror = (event) => {
  //     console.error('WebSocket error:', event);
  //     console.log('disconeected on close2')
  //     this.updateWebSocketState('disconnected');
  //     this.reconnect(); // Tentative de reconnexion
  //   };
  // }

  public connect(webSocketToken: string): void {
    // Vérifiez si le WebSocket est déjà connecté ou en cours de connexion
    if (this.webSocketState === 'connected' || this.webSocketState === 'connecting') {
      console.log('WebSocket is already connected or connecting');
      return;
    }
  
    this.updateWebSocketState('connecting');
    const url = `wss://192.168.199.129:3443/path?token=${webSocketToken}`;
    this.webSocket = new WebSocket(url);
  
    this.webSocket.onopen = () => {
      console.log('WebSocket connection established');
      this.updateWebSocketState('connected');
      this.reconnectAttempts = 0; // Réinitialisez les tentatives de reconnexion après une connexion réussie
    };
  
    this.webSocket.onmessage = (message) => {
      if (message.data) {
        const data = JSON.parse(message.data);
        console.log('Message reçu dans onmessage:', data);
        this.messagesSubject.next(data);
      }
    };
  
    this.webSocket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.updateWebSocketState('disconnected');
      if (event.code !== 1000) { // 1000 est un code de fermeture normal
        this.reconnect(); // Tentative de reconnexion seulement en cas de fermeture anormale
      }
    };
  
    this.webSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.updateWebSocketState('disconnected');
      this.reconnect(); // Tentative de reconnexion
     
    };
  }
  

  public onMessage(): Observable<any> {
    return this.messages$;
  }

  public isConnected(): boolean {
    return this.webSocket?.readyState === WebSocket.OPEN;
  }

  // public sendMessage(conversationId: number, recipientId: number, content: string): void {
  //   if (this.webSocketState === 'connected' && this.webSocket) {
  //     this.webSocket.send(JSON.stringify({ type: 'newMessage', conversationId, recipientId, content }));
  //   } else {
  //     console.error('WebSocket is not connected. Trying to reconnect... sending message');
  //     this.reconnect();
  //   }
  // }
  public sendMessage(conversationId: number, recipientId: number, content: string): void {
    this.ensureConnected().then(() => {
      // A ce stade, le WebSocket est connecté
      if (this.webSocket) {
        this.webSocket.send(JSON.stringify({ type: 'newMessage', conversationId, recipientId, content }));
      } else {
        console.error('WebSocket is connected but the instance is undefined.');
      }
    }).catch(error => {
      console.error('Impossible de se connecter au WebSocket:', error);
    });
  }
  

  // public send(message: any): void {
  //   if (this.webSocketState === 'connected' && this.webSocket) {
  //     this.webSocket.send(JSON.stringify(message));
  //   } else {
  //     console.error('WebSocket is not connected. Trying to reconnect... send');
  //     this.reconnect();
  //   }
  // }
  public send(message: any): void {
    this.ensureConnected().then(() => {
      // A ce stade, le WebSocket est connecté
      if (this.webSocket) {
        this.webSocket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is connected but the instance is undefined.');
      }
    }).catch(error => {
      console.error('Impossible de se connecter au WebSocket:', error);
    });
  }
  
  public sendMessageStatusUpdate(conversationId: number, userId: number, newStatus: string): void {
    this.ensureConnected().then(() => {
      // A ce stade, le WebSocket est connecté
      if (this.webSocket) {
        this.webSocket.send(JSON.stringify({ type: 'updateStatus', conversationId, userId, newStatus }));
      } else {
        console.error('WebSocket is connected but the instance is undefined.');
      }
    }).catch(error => {
      console.error('Impossible de se connecter au WebSocket:', error);
    });
  }
  

  public close(): void {
    this.webSocket?.close();
  }


  // Dans WebSocketService

public ensureConnected(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (this.isConnected()) {
      resolve();
    } else {
      console.log('WebSocket is not connected. Trying to reconnect...');
      this.reconnect();
      const checkInterval = setInterval(() => {
        if (this.isConnected()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000); // Vérifiez toutes les secondes
    }
  });
}

}
