import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Subscription, take, pipe } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RouterEvent } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';

import { ActivatedRoute } from '@angular/router';
// import { FriendsComponent } from '../friends/FriendsComponent';
import { ProfileComponent } from '../profile/profile.component';
import { SocketService } from '../../services/socket.service';
import { PlayComponent } from '../play/play.component';
import { LogService } from 'src/app/services/log.service';
import { normalize } from '@angular-devkit/core';

@Component({
  selector: 'app-play-menu',
  templateUrl: './play-menu.component.html',
  styleUrls: ['./play-menu.component.css']
})
export class PlayMenuComponent implements OnInit, OnDestroy {

  friendlist: number[] = [];
  curId!: number;

  isLogged: boolean = true;
  isFull:boolean = false;
  subscription!: Subscription;
  roomjoingned: boolean = false;
  Queuejoingned: boolean = false;
  users: string[] = [];
  NoRedir: boolean = true;
  roomCreated: boolean = false;
  roomToJoin: string = "";
  username: string = "";
  room: string = "";
  CreateRoom: string = "";
  JoinRoom: string = "";
  private clickEnabled: boolean = true;
  roomNumber: any = 0;
  selectedGameMode: string = 'regular'; // default game mode
  selectedColor: string = '#ffde56'; // Default color

  constructor( private socketService: SocketService,
               private uInfoService: UserInfoService, 
               private router: Router, 
               private logService: LogService,
               private route: ActivatedRoute
               ) {
                this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
                .subscribe(event => {
                  if (
                    event.id === 1 &&
                    event.url === event.urlAfterRedirects
                  ) {
                    this.uInfoService.user$.pipe(take(1)).subscribe((user) => (this.username = user.name))
                    console.log('refresh: ' + ' | ' + this.username);             
                    this.socketService.leaveQueue(this.username);
                  }
                });
               }

  ngOnInit() {
    this.uInfoService.user$.pipe(take(1)).subscribe( (user) => {
      console.log('Utilisateur connecté:', user.name); // Log de débogage
      this.username = user.name;
      this.curId = user.id;
    });
    this.route.queryParams.subscribe(params => {
      if (params['CreateRoom']) {
        this.CreateRoom = params['CreateRoom'];
        this.createRoom(); // Call createRoom if CreateRoom param is present
      }
      if (params['JoinRoom']) {
        this.JoinRoom = params['JoinRoom'];
        this.roomToJoin = this.JoinRoom;
        this.joinRoom(); // Call joinRoom if JoinRoom param is present
      }
    });
    this.socketService.onStartGame().subscribe((data) => {
      this.NoRedir = false;
      this.router.navigate(['/play'], { queryParams: { color: this.selectedColor , room: this.room} });
    });
    this.socketService.onJoinRoom().subscribe((room) => {
      this.room = room;
      this.socketService.joinRoom(room, this.username);
      this.NoRedir = false;
      this.router.navigate(['/play'], { queryParams: { color: this.selectedColor , room: this.room} });
    });

  }
  
  joinRoom() {
    if (this.roomToJoin == '') {
      alert("No Room number given!");
      console.log("console: No room number given!");
      return;
    }
  
    // Check if the input is alpha-numerical
    const alphaNumericalPattern = /^[a-zA-Z0-9]*$/;
    if (!alphaNumericalPattern.test(this.roomToJoin)) {
      alert("Room number must be alphanumeric!");
      console.log("console: Room number must be alphanumeric!");
      this.roomToJoin = '';
      return;
    }
  
    // Check for length constraints
    if (this.roomToJoin.length < 4 || this.roomToJoin.length > 10) {
      alert("Room number must be between 4 to 10 characters!");
      console.log("console: Room number must be between 4 to 10 characters!");
      this.roomToJoin = '';
      return;
    }
  
    console.log("La méthode joinRoom a été appelée avec la room :", this.roomToJoin);
    this.socketService.checkRoom(this.roomToJoin).pipe(take(1)).subscribe(roomStatus => {
      if (roomStatus === 'full') {
        alert('This room is already full. Please try a different room.');
        this.roomToJoin = '';
        return;
      } else if (roomStatus === 'noRoom') {
        alert('This room does not exist. Please try a different room.');
        this.roomToJoin = '';
        return;
      }
    this.socketService.joinRoom(this.roomToJoin, this.username);
    this.socketService.onUpdateUserList().subscribe((users: string[]) => {
      console.log("Liste des utilisateurs reçue du serveur:", users);
      if (users.length == 1)
        this.roomCreated = true;
      this.users = users;
    });
    this.roomjoingned = true;
    this.room = this.roomToJoin;
    });
  }
  
  createRoom() {
    console.log("La méthode createRoom a été appelée"); // Log de débogage
    this.roomCreated = true;
    this.room = this.generateRoomId(); // Utilisez une fonction pour générer un ID unique
    if (this.CreateRoom)
      this.room = this.CreateRoom;
    this.socketService.joinRoom(this.room, this.username);
    console.log("Creation de la salle:", this.room); // Log de débogage
    console.log("Nom d'utilisateur:", this.username); // Log de débogage

    this.socketService.onUpdateUserList().subscribe((users: string[]) => {
      console.log("Liste des utilisateurs reçue du serveur:", users);
      this.users = users;
    });
  }

  leaveRoom(): void {
    if (this.roomjoingned || this.roomCreated) {
      // Appel synchrone au service socket pour quitter la salle
      this.socketService.leaveRoom(this.room, this.username);
  
      // Mise à jour des états du component
      this.roomjoingned = false;
      this.roomCreated = false;
      this.room = "";
    }
  }

  generateRoomId(): string {
    // Générez un ID unique pour la room. Utilisez un nombre aléatoire pour simplifier
    return Math.random().toString(36).substring(7);
  }

  startGame() {
    this.socketService.startGame(this.room, this.selectedGameMode);
    this.NoRedir = false;
    this.router.navigate(['/play'], { queryParams: { color: this.selectedColor , room: this.room } });
  }

  leaveQueue() {
    this.Queuejoingned = false;
    this.socketService.leaveQueue(this.username); // Vous pouvez transmettre d'autres informations si nécessaire
  }

  joinQueue() {
    this.Queuejoingned = true
    this.leaveRoom();
    this.socketService.joinQueue(this.username);
    this.socketService.onUpdateUserList().subscribe((users: string[]) => {
      console.log("Liste des utilisateurs reçue du serveur:", users);
      this.users = users;
    });
  }

  limitedClick() {
    if (this.clickEnabled) {
      this.clickEnabled = false;
      console.log('Bouton cliqué!');

      setTimeout(() => {
        this.clickEnabled = true;
      }, 1000); // Réactive le bouton après 1 seconde
    }
  }

  ngOnDestroy() {
    if(this.NoRedir === true) {
      this.socketService.leaveRoom(this.room, this.username);
    }
    if (this.Queuejoingned) {
      this.socketService.leaveQueue(this.username);
    }
}
}