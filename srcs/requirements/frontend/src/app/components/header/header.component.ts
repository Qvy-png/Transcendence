import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  

  constructor(private router: Router) {}

  whichRoute(): number {
    switch(this.router.url) {
      case '/': // Main Menu
          console.log("salut");
          return (1);
          break;
      case '/profile': // Profile Menu
          return (2);
          break;
      case '/friends': // Friends Menu
          return (3);
          break;
      case '/settings': // Settings Menu
          return (4);
          break;
      case '/play': // Game Menu
          return (5);
          break;
    }
    return (0);
  }

}
