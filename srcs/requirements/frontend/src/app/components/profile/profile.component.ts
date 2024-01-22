import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Info, Status, Infos } from 'src/app/User';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { faPen, faFloppyDisk, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

curUserProfile: boolean = false;

/** id passed through route*/
id!: number;

/** Current User id*/
userId!: number;

faPen = faPen;
faDisk = faFloppyDisk;
faCross = faCircleXmark;

name!: string;
changingName: boolean = false;
newName: string = '';

rank!: number;
games!: number; 
wins!: number;
looses!: number;

status: Status = 'ONLINE';
color: string = '#46C34B';

img: string = '';
imageSrc!: string;

histories: any[] = []; //recupere tout les parties jouer par l'user


constructor(private uInfoService: UserInfoService, private logService: LogService, private route: ActivatedRoute, private router: Router) {

}


	
getGames(): number {
	return (this.games ? this.games : 0);
}

getRank(): number {
	return (this.rank ? this.rank : NaN);
}

getWins(): number {
	return (this.wins ? this.wins : 0);
}

getLooses(): number {
	return (this.looses ? this.looses : 0);
}

changeName() {
	console.log('newName: ' + this.newName);
	
	if (this.newName == '' || this.newName == undefined) {
		alert('No new Name given !');
		return ;
	}
	
	this.logService.getUserByName(this.newName).subscribe({
		next: (value) => { // Not OK (Un User porte deja ce nom)
				alert('name already in use ! Try another !');
				return ;
		},
		error: (value) => { // OK (Aucun User n'a ce nom)
			// console.log(value);
			
			this.uInfoService.user$.subscribe({
				next: (user) => {
					console.log('updating name: ' + user.name + ' => ' + this.newName);
					
					let nameInfo = { name: this.newName }

					this.logService.updateUser(user.id, nameInfo).subscribe(
						(value) => {
							console.log('update done');
							window.location.reload();
						}
					);
				}
			});
			this.changingName = false;

		}
});
}

changeStatus() {
	this.uInfoService.uInfo$.subscribe({
		next: (uInfo) => {
			if (this.status == 'ONLINE') {
				this.status = 'BUSY';
				this.color = '#D75050';
			} else {
				this.status = 'ONLINE';
				this.color = '#46C34B';
			}
			uInfo.status = this.status;
			const statusInfo = {status: this.status};
	
			this.logService.updateUser(uInfo.id, statusInfo).subscribe(
				(value) => {
					console.log('update done');
			});
		}
	});
}

ngOnInit(): void {
	// Charge le profile avec l'id passe via la route
	this.route.queryParams.subscribe( (params) => {
		this.id = params['id'];
	});

	// AJOUTER PROTECTION BLOCKAGE
	// alert + navigate main
	
	this.logService.getUserById(this.id).subscribe((infos) => {
		this.uInfoService.user$.subscribe( (user) => this.userId = user.id);
		console.log('curUser id [' + this.userId + '] = [' + this.id + '] passed id');
		if (this.userId == infos.id) {
			this.curUserProfile = true;
		}
		this.games = infos.games;
		this.rank = infos.rank;
		this.wins = infos.wins;
		this.looses = infos.looses;
		this.status = infos.status;
		this.img = infos.img;
		this.name = infos.name;

		this.imageSrc = this.img;

		switch(this.status) {
			case 'ONLINE':
				this.color = '#46C34B';
				break
			case 'INGAME':
				this.color = '#46C34B';
				break;
			case 'OFFLINE':
				this.color = '#6F6F6F';
				break;
			case 'BUSY':
				this.color = '#D75050';
				break;
		}

		//recup les infos historic
		this.logService.getUserHistory(this.id).subscribe({
			next: (value) => {
				this.histories = (value as any[]);
				this.histories.reverse();
			}
		});
	});
}
}
