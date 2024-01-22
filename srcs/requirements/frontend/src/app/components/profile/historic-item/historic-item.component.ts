import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Historic, Infos } from 'src/app/User';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-historic-item',
  templateUrl: './historic-item.component.html',
  styleUrls: ['./historic-item.component.css']
})
export class HistoricItemComponent implements OnInit{
  @Input() game!: Historic;
  
  oppId!: number;
  color!: string;
  
  curUser!: string;
  oppUser!: string;

  curUserScore!: number;
  oppUserScore!: number;

  gameId!: number;
  date!: string;
  mode!: string;

  showDetails: boolean = false;
  size: string = '45px';

  constructor(private uInfoService: UserInfoService, private logService: LogService, private route: Router) {}

  toggleHisDetails() {
    this.showDetails = !this.showDetails;

    this.size = this.showDetails ? '90px' : '45px';
  }

  goProfile() {
    this.uInfoService.isBlocked(this.oppId).subscribe( (value) => {
      if (!value) {
        this.route.navigateByUrl('/', {skipLocationChange: true}).then(() =>
        this.route.navigate(['profile'], { queryParams: {id: this.oppId} }));
      }
    });
  }

  ngOnInit(): void {
    this.logService.getUserByName(this.game.opponentName).subscribe((value) => {
      // Convertie la value en string JSON et se debarasse des []
      let objUser = JSON.stringify(value);

      // Trim la string pour ne plus avoir les [] qui empeche la conversion
      objUser = objUser.substring(1, objUser.length-1);

      // Convertie la string trimee en objet
      const targetUser: Infos = JSON.parse(objUser);
      this.oppId = targetUser.id;
      
      this.logService.getUserById(Number(this.game.userId)).subscribe((user) => {
      this.curUser = user.name
      
      this.oppUser = this.game.opponentName;
      
      this.gameId = this.game.gameId;
      this.date = this.game.date.substring(0, this.game.date.length - 5);
      this.mode = this.game.mode;
      
      this.curUserScore = this.game.scorePlayerOne;
      this.oppUserScore = this.game.scorePlayerTwo;

      this.color = (this.curUserScore > this.oppUserScore) ? '#46C34B' : '#D75050';
    });
  });
  }
}
