import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpInterceptor } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserLog, Info, Infos } from '../User';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private auth: boolean = false;

  private subject = new Subject<any>();

  private apiUrl = 'http://localhost:3000/User';
  private signUpUrl = 'sign-up';
  private signInUrl = 'sign-in';
  private curUser = 'auth/me';

  constructor(private http: HttpClient, private router: Router) { }

  toggleConnection(user: UserLog): Observable<any> {
    let loginInfo = { email: user.email, password: user.password}
    return this.http.post<any>(`${this.apiUrl}/${this.signInUrl}`, JSON.stringify(loginInfo), httpOption);
  }

  logout(id: number) {
    this.http.delete<UserLog>(`${this.apiUrl}/${id}`).subscribe( {
      next: value => {
        this.auth = false;
      }
    });
  }

  isLogged(): boolean {
    return this.auth;
  }

  setAuth(auth: boolean) {
    this.auth = auth;
  }

  getUser(auth_token: string): Observable<Info> {
    // console.log(`auth: ${auth_token}`);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });
    
    const httpOption = { headers: headers };
    return this.http.get<Info>(`${this.apiUrl}/${this.curUser}`, httpOption);
  }

  getUserByName(name: string): Observable<Infos> {
    return this.http.get<Infos>(`${this.apiUrl}/${name}`);
  }

  getUsers(): Observable<UserLog[]> {
    return this.http.get<UserLog[]>(this.apiUrl);
  }

  addUser(user: UserLog): Observable<UserLog> {
    // console.log("New User register: `${user}`");
    return this.http.post<UserLog>(`${this.apiUrl}/${this.signUpUrl}`, user, httpOption);
  }



}
