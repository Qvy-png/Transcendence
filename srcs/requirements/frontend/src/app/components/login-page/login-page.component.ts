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
	private apiUrl = 'https://api.intra.42.fr/oauth/authorize';
	private clientIdServ = '?client_id=u-s4t2ud-2c044f5e3d78865bec2a409a277aea2aafbbdc9b4452a820f1d3db8b06e8f80a';
	private redirect = '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi42%2Fcallback';
	private response = '&response_type=code';
	private scope = '&scope=public';
	private state = '&state=qwertyuiop'

	link = `${this.apiUrl}${this.clientIdServ}${this.redirect}${this.scope}${this.response}${this.state}`;


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

	to_42Login() {

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
				// console.log('value: ' + `${token}`);

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

			this.uInfoService.setUserByName(newUser.name);

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
