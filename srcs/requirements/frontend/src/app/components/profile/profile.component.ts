import { Component, OnInit } from '@angular/core';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	constructor(private uInfoService: UserInfoService) {}

	rank!: number;

	wins: number = 0;
	looses: number = 0;

	getRank(): number {
		return (this.rank ? this.rank : NaN);
	}

	getWins(): number {
		return (this.wins);
	}

	getLooses(): number {
		return (this.looses);
	}

	ngOnInit(): void {
		this.uInfoService.uInfo$.subscribe( (uInfo) => {
			this.rank = uInfo.rank;
			this.wins = uInfo.wins;
			this.looses = uInfo.looses;
		} );
	}
}
