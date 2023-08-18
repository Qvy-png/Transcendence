import { Component, OnInit } from '@angular/core';
import { LogService } from 'src/app/services/log.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  isLogged: boolean = true;
  subscription!: Subscription;

  constructor(private logService: LogService) {
    
  }

  ngOnInit(): void {}

}
