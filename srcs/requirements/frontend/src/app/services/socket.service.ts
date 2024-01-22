import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

interface GameState {
  ball: { x: number, y: number, dx: number, dy: number };
  paddle1: { y: number };
  paddle2: { y: number };
  score1: number;
  score2: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket;
  public gameState = new Subject<GameState>();
  public gameStart = new Subject<any>();
  public playerAssignment = new Subject<string>(); // New Subject for player assignment
  public winner = new Subject<string>();
  public players = new Subject<string>();

  constructor() {
    // Connect to the socket server
    this.socket = io('http://localhost:3001'); // replace with your server address

    // Listen to the 'start' event from the server
    this.socket.on('start', (data: any) => {
      console.log('Game starting ws service', data);
      this.gameStart.next(data);
    });

    // Listen to the 'updateState' event from the server
    this.socket.on('updateState', (state: GameState) => {
      // console.log('Received game state', state);
      this.gameState.next(state);
    });

    // Listen to the 'assignPlayer' event from the server
    this.socket.on('assignPlayer', (role: string) => {
      console.log('Received player assignment', role);
      this.playerAssignment.next(role);
    });

    // Listen to the 'players' event from the server
    this.socket.on('players', (role: string) => {
      console.log('Received player names', role);
      this.players.next(role);
    });

    this.socket.on('gameOutcome', (winner: string) => {
      console.log('Received game winner', winner);
      this.winner.next(winner);
    });

    // Error handling
    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection Error', error);
    });

  }
  checkRoom(roomToJoin: string): Observable<string> {
    this.socket.emit('checkRoom', { room: roomToJoin });
  
    return new Observable(observer => {
      this.socket.on('roomStatus', (response) => {
        observer.next(response.status);
      });
    });
  }


  // Emit the 'move' event to the server
  move(paddle: string, y: number) {
    this.socket.emit('move', { paddle, y });
  }

  start(message: string, username: string) {
    this.socket.emit('start', { message, username });
  }

  joinRoom(room: string, username: string) {
    this.socket.emit('joinRoom', { room, username });
  }

  
  startGame(room: string, gameMode : string) {
    this.socket.emit('startGame', { room: room, gameMode: gameMode });
  }
  
  joinQueue(username: string) {
   
    this.socket.emit('joinQueue', {username: username});
    console.log(username);
    
  }
  
  
  onStartGame(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('startGame', (data) => {
        observer.next(data);
      });
    });
  }
  
  onJoinRoom(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('joinRoom', (room) => {
        observer.next(room);
      });
    });
  }
  
  leaveQueue(username: string): void {
    console.log('leave queue');
    
    this.socket.emit('leaveQueue', username);
  }
  
  leaveRoom(room: string, username: string) {
    this.socket.emit('leaveRoom', { room, username });
  }
  
  destroyRoom(room: string): void {
    
  }

  onUpdateUserList() {
    return new Observable<string[]>((observer) => {
      this.socket.on('updateUserList', (users) => {
        observer.next(users);
      });
    });
  }
  // Gracefully disconnect when the service is destroyed
  ngOnDestroy() {
    this.socket.disconnect();
  }
}
