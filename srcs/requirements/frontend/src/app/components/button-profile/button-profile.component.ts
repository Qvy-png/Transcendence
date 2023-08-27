import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
  
  constructor(private logService: LogService, private uInfoService: UserInfoService) {
    this.isLoggedIn = this.logService.isLogged();
  }

  isLoggedIn?: boolean;
  
  @Output() btnClick = new EventEmitter();

  goProfile() {
    (this.isLoggedIn) ? this.btnClick.emit(true) : this.btnClick.emit(false);
  }

  ngOnInit(): void {
    this.uInfoService.user$.subscribe( (user) => {
      this.username = user.name;
      this.id = user.id;
      // if (user.img == null)

    });
  }

}
