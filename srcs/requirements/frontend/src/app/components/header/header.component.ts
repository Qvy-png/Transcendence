import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  id: number  = 0;

  constructor(private router: Router, private logService: LogService, private uInfoService: UserInfoService) {
  }

  whichRoute(): number {
    // console.log(this.router.url);
    switch(this.router.url) {
      case '/main': // Main Menu
          return (1);
      case '/profile': // Profile Menu
          return (2);
      case '/friends': // Friends Menu
          return (3);
      case '/settings': // Settings Menu
          return (4);
      case '/play': // Game Menu
          return (5);
    }
    return (0);
  }



  disconnect() {
    this.logService.logout(this.id);
    this.router.navigate(['login']);
  }

  ngOnInit(): void {
    this.uInfoService.user$.subscribe( (user) => {
      this.id = user.id
    });
  }

}
