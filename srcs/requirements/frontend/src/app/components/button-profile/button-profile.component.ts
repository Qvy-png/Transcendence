import { Component, Output, EventEmitter } from '@angular/core';
import { LogService } from 'src/app/services/log.service';

@Component({
  selector: 'app-button-profile',
  templateUrl: './button-profile.component.html',
  styleUrls: ['./button-profile.component.css']
})
export class ButtonProfileComponent {

  isLoggedIn?: boolean;

  constructor(private logService: LogService) {
    this.isLoggedIn = this.logService.isLogged();
  }
  
  @Output() btnClick = new EventEmitter();

  goProfile() {
    (this.isLoggedIn) ? this.btnClick.emit(true) : this.btnClick.emit(false);
  }

}
