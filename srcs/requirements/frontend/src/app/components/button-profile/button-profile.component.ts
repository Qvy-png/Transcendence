import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-button-profile',
  templateUrl: './button-profile.component.html',
  styleUrls: ['./button-profile.component.css']
})
export class ButtonProfileComponent implements OnInit {
  
  username: string = '';
  id: number = 0;
  img?: string = '';
  imageSrc?: string;

  constructor(private logService: LogService, private uInfoService: UserInfoService, private route: Router) {
    // this.isLoggedIn = this.logService.isLogged();
  }

  isLoggedIn: boolean = true;

  goProfile() {
    console.log('navigate to profile');
    this.route.navigate(['profile'], { queryParams: {id: this.id} });
  }

  ngOnInit(): void {
    this.uInfoService.user$.subscribe( (user) => {
      this.username = user.name;
      this.id = user.id;
      this.img = user.img;

      this.imageSrc = this.img;
    });
      
  }

}
