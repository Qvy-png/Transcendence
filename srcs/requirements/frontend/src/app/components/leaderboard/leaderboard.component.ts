import { Component, OnInit } from '@angular/core';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

interface Player {
  name: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  public rankers!: any[];

   
    // ... (plus d'objets Player ici)
  ;


  constructor(private uInfoService: UserInfoService, private logService: LogService) {}

	faCrown = faCrown;

	rank!: any;

	wins: number = 0;
	looses: number = 0;
	name: string = "";

	getRankU(): number {
		return (this.rank ? this.rank : NaN);
	}

	getWinsU(): number {
		return (this.wins);
	}

	getLoosesU(): number {
		return (this.looses);
	}

	getNameU(): string {
		return (this.name);
	}

  

	ngOnInit(): void {
    this.uInfoService.user$.subscribe( (user) => {
      this.name = user.name;
      // if (user.img == null)

    });

    this.uInfoService.uInfo$.subscribe( (uInfo) => {
			this.rank = uInfo.rank;
			this.wins = uInfo.wins;
			this.looses = uInfo.looses;
		} );
		this.logService.getUsers().subscribe( (data) => {
      this.rankers = (data as any[]).sort((a, b) => b.rank - a.rank);
	  })
  }



}
