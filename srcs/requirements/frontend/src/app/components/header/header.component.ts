import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { PlayMenuComponent } from '../play-menu/play-menu.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  id: number  = 0;
  username!: string;
  @Input() whosId!: number;
  @Input() room!: string;
  curUserProfile: boolean = false;

  constructor(private router: Router, private logService: LogService, private uInfoService: UserInfoService, private socketService: SocketService) {
  }

  whichRoute(): number {
    // Obtenir l'URL actuelle sans la partie de la requête
    const url = this.router.url.split('?')[0];
    // console.log(url);
    switch(url) {
      case '/main': // Main Menu
          return (1);
      case '/profile': // Profile Menu
          return (2);
      case '/friends': // Friends Menu
          return (3);
      case '/settings': // Settings Menu
          return (4);
      case '/twoFa': // Settings 2FA
          return (4);
      case '/play-menu': // Game Menu
          return (5);
      case '/leaderboard': // leaderboard Menu
          return (6);
    }
    return (0);
  }

  onQuit(): void {
    this.socketService.leaveQueue(this.username);
    this.socketService.leaveRoom(this.room, this.username);
  }

  disconnect() {
    this.logService.logout(this.id);
  }

  ngOnInit(): void {
    this.uInfoService.user$.pipe(take(1)).subscribe( (user) => {
      this.id = user.id
      this.username = user.name;
    });
    
    if (this.whichRoute() == 2 && this.id == this.whosId) { // Verifie si le header a affiche est celui du curUser ou d'un User pointer
      this.curUserProfile = true;
    }
    
    if (this.room) {
      console.log("DESTROYINNNNNG");
      
      // this.onQuit();
    }
  }
}
