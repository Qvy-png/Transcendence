import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import {take} from 'rxjs/operators'

import { UserLog } from 'src/app/User';

@Component({
	selector: 'app-login-page',
	templateUrl: './login-page.component.html',
	styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
	private apiUrl = 'https://api.intra.42.fr/oauth/authorize';
	private clientIdServ = '?client_id=u-s4t2ud-2c044f5e3d78865bec2a409a277aea2aafbbdc9b4452a820f1d3db8b06e8f80a';
	private redirect = '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi42%2Fcallback';
	private response = '&response_type=code';
	private scope = '&scope=public';
	private state = '&state=qwertyuiop'

	link = `${this.apiUrl}${this.clientIdServ}${this.redirect}${this.scope}${this.response}${this.state}`;


	signUp = false;

	name!:			string;
	email!:			string;
	password!:		string;
	twoFa!:			boolean;
	usersLog: UserLog[] = [];

	constructor(private logService: LogService, private cookieService: CookieService,
				private router: Router, private route: ActivatedRoute, private uInfoService: UserInfoService,
				private http: HttpClient) {}

	ngOnInit(): void {
		const token = this.logService.log_42();
		if (token) { // access_token from 42 is good
			console.log('42 connection');
			
			this.uInfoService.setToken('42_token', token);

			this.uInfoService.getInfo(this.uInfoService.getToken('42_token')).pipe(take(1)).subscribe((info) => {
				let twoFa = info.twoFactor;
				let curId = info.id;

				if (twoFa) {
					console.log('42 log with 2fa');
					this.router.navigate(['twoFaLog'], { queryParams: {id: curId} });
				} else {
					console.log('42 log with NO 2fa');
					this.logService.setAuth(true);

					let statInfo = {status: 'ONLINE'};
					this.logService.updateUser(curId, statInfo).pipe(take(1)).subscribe();
					
					this.router.navigate(['/']);

				}
			});
		}
	}


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

		this.logService.toggleConnection(user).pipe(take(1)).subscribe(
			(value) => {
				const token = JSON.stringify(value);
				// console.log('value: ' + `${token}`);
				//Ajout du Token dans le cookie pour de prochainnes connections
				this.cookieService.deleteAll();
				this.uInfoService.setToken('id_token', token);

				this.uInfoService.setUser();

				setTimeout(() => { // Attend que setUser est finit d'init les Subjects
					this.uInfoService.uInfo$.pipe(take(1)).subscribe((user) => {			
						console.log(user);
								
						if (user.twoFactor) {
							console.log("verify 2Fa");
							this.router.navigate(['twoFaLog'], { queryParams: {id: user.id} });
						} else {
							console.log("no 2Fa");
							//Route to main page
							this.logService.setAuth(true);

							let statInfo = {status: 'ONLINE'};
							this.logService.updateUser(user.id, statInfo).pipe(take(1)).subscribe();

							this.router.navigate(['/']);
						}
					})
				} , 100 * 1);
			},
			error => {
				if (error.status == 401) {
					alert("Wrong Identifiers !");
					this.logService.setAuth(false);
				}
			}
		);

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
		
		if (!this.name || !this.email || !this.password) {
			alert('Please fill all info');
			return ;
		}

		this.logService.getUserByName(newUser.name).subscribe({
			next: (value) => { // Not OK (Name already in use)
				alert('name already in user !');
				this.name = '';
				return ;
			},
			error: (value) => { // OK (Name not already in use)
				this.logService.addUser(newUser).subscribe({
					next: (user) => {
						console.log("New User register done, connection: " + JSON.stringify(newUser) );
						this.logService.toggleConnection(newUser).subscribe({
							next: (value) => {
								const token = JSON.stringify(value);
								console.log('register ok: ' + `${token}`);
								this.cookieService.deleteAll();
								//Ajout du Token dans le cookie pour de prochainnes connections
								this.uInfoService.setToken('id_token', token);
				
								//Recupere les infos de l'user via le token
								this.uInfoService.setUser();
				
								//Route to main page
								this.logService.setAuth(true);
								this.router.navigate(['/']);
							},
							error: (value) => {
								if (value.status == 401) {
									alert("Wrong Identifiers !");
									this.logService.setAuth(false);
								}
							}
						});
					},
					error: (user) => {
						// console.log(user);
						alert("Email in use, Please sign-in !");
						this.logService.setAuth(false);
						return ;
					}
				});
			}
		});
	}
}
