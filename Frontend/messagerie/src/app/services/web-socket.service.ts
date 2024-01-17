// web-socket.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket?: WebSocket;
  private webSocketState: 'connected' | 'disconnected' | 'connecting' =
    'disconnected';
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  private reconnectAttempts = 0;

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

  private updateWebSocketState(
    state: 'connected' | 'disconnected' | 'connecting'
  ) {
    this.webSocketState = state;
    console.log('WebSocket state:', this.webSocketState);
  }


  public connect(webSocketToken: string): void {
    // Vérifiez si le WebSocket est déjà connecté ou en cours de connexion
    if (
      this.webSocketState === 'connected' ||
      this.webSocketState === 'connecting'
    ) {
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

    // this.webSocket.onmessage = (message) => {
    //   if (message.data) {
    //     const data = JSON.parse(message.data);
    //     console.log('Message reçu dans onmessage:', data);
    //     this.messagesSubject.next(data);
    //   }
    // };

    this.webSocket.onmessage = (message) => {
      if (message.data) {
        const data = JSON.parse(message.data);
        console.log('Message reçu dans onmessage:', data);
    
        // Gérer ici les messages de groupe reçus
        if (data.type === 'groupMessageResponse' && data.groupId && data.messages) {
          // Traiter les messages de groupe ici, par exemple
          // en les ajoutant à messagesSubject
          this.messagesSubject.next(data);
        } else {
          // Gérer les autres types de messages
          this.messagesSubject.next(data);
        }
      }
    };

    this.webSocket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.updateWebSocketState('disconnected');
      if (event.code !== 1000) {
        // 1000 est un code de fermeture normal
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

  public sendMessage(
    conversationId: number,
    recipientId: number,
    content: string
  ): void {
    this.ensureConnected()
      .then(() => {
        // A ce stade, le WebSocket est connecté
        if (this.webSocket) {
          this.webSocket.send(
            JSON.stringify({
              type: 'newMessage',
              conversationId,
              recipientId,
              content,
            })
          );
        } else {
          console.error(
            'WebSocket is connected but the instance is undefined.'
          );
        }
      })
      .catch((error) => {
        console.error('Impossible de se connecter au WebSocket:', error);
      });
  }

  public send(message: any): void {
    this.ensureConnected()
      .then(() => {
        // A ce stade, le WebSocket est connecté
        if (this.webSocket) {
          this.webSocket.send(JSON.stringify(message));
        } else {
          console.error(
            'WebSocket is connected but the instance is undefined.'
          );
        }
      })
      .catch((error) => {
        console.error('Impossible de se connecter au WebSocket:', error);
      });
  }

  public sendMessageStatusUpdate(
    conversationId: number,
    userId: number,
    newStatus: string
  ): void {
    this.ensureConnected()
      .then(() => {
        // A ce stade, le WebSocket est connecté
        if (this.webSocket) {
          this.webSocket.send(
            JSON.stringify({
              type: 'updateStatus',
              conversationId,
              userId,
              newStatus,
            })
          );
        } else {
          console.error(
            'WebSocket is connected but the instance is undefined.'
          );
        }
      })
      .catch((error) => {
        console.error('Impossible de se connecter au WebSocket:', error);
      });
  }

  public close(): void {
    this.webSocket?.close();
  }


















  public sendGroupMessageRequest(groupId: number): void {
    this.ensureConnected()
      .then(() => {
        if (this.webSocket) {
          this.webSocket.send(JSON.stringify({
            type: 'demandeHistoriqueMessagesGroupe',
            groupId,
          }));
        } else {
          console.error('WebSocket is connected but the instance is undefined.');
        }
      })
      .catch(error => console.error('Impossible de se connecter au WebSocket:', error));
  }

  



  public sendGroupMessage(groupId: number, content: string): void {
    this.ensureConnected()
      .then(() => {
        // A ce stade, le WebSocket est connecté
        if (this.webSocket) {
          this.webSocket.send(
            JSON.stringify({
              type: 'newGroupMessage',
              groupId,
              content,
            })
          );
        } else {
          console.error(
            'WebSocket is connected but the instance is undefined.'
          );
        }
      })
      .catch((error) => {
        console.error('Impossible de se connecter au WebSocket:', error);
      });
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
