import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

	constructor() {}

	rank!: number;

	victory: number = 0;
	loose: number = 0;

	getRank(): number {
		return (this.rank ? this.rank : NaN);
	}

	getVictories(): number {
		return (this.victory);
	}

	getLooses(): number {
		return (this.loose);
	}
}
