import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

import { UserLog } from 'src/app/User';

@Component({
	selector: 'app-login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

	constructor(private logService: LogService, private cookieService: CookieService, private router: Router, private uInfoService: UserInfoService) {
		if (this.logService.isLogged()) {
			this.router.navigate(['/main']);
		} else {

		}
	}

	signUp = false;

	name!:			string;
	email!:			string;
	password!:		string;

	usersLog: UserLog[] = [];

	showSignUp() {
		this.signUp = true;
		
		// Remet les inputs a vide
		this.name = '';
		this.email = '';
		this.password = '';
	}

	showSignIn() {
		this.signUp = false;
		
		// Remet les inputs a vide
		this.name = '';
		this.email = '';
		this.password = '';
	}

	onSubmit() {
		const user: UserLog = {
			name: this.name,
			email: this.email,
			password: this.password
		}

		// Appel du service pour verifier la connection
		this.logService.toggleConnection(user).subscribe(
			(value) => {
				const token = JSON.stringify(value);
				console.log('value: ' + `${token}`);
				
				//Ajout du Token dans le cookie pour de prochainnes connections
				this.uInfoService.setToken(token);

				this.uInfoService.setUser();


				//Route to main page
				this.router.navigate(['/']);
				this.logService.setAuth(true);
			},
			error => {
				if (error.status == 401) {
					alert("Wrong Identifiers !");
					this.logService.setAuth(false);
				}
			}
		);




		// this.logService.toggleConnection(user).subscribe({ next: (ConnectionToken) => {

		// 	},
		// 	}
		// });



		// Remet les inputs a vide
		this.name = '';
		this.email = '';
		this.password = '';

	}

	deleteCookies() {
		this.cookieService.deleteAll();
	}

	register() {
		const newUser = {
			name:     this.name,
			email:    this.email,
			password: this.password
		}

		this.logService.addUser(newUser).subscribe( (user) => {
			
			this.router.navigate(['/']);
			this.logService.setAuth(true);
		},
			error => {
				// console.log(user);
				alert("Error: Existing user !");
				this.logService.setAuth(false);
		});

		// Remet les inputs a vide
		this.name = '';
		this.email = '';
		this.password = '';
	}

}
