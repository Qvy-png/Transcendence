import { Injectable } from '@angular/core';
import { Observable, Subject, pipe, take } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserLog, Info, Infos, UserInfo } from '../User';
import { JsonPipe } from '@angular/common';
import { LevelCapLogger } from '@angular-devkit/core/src/logger';
import { CookieService } from 'ngx-cookie-service';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class LogService {

  twoFA: boolean = false;
  twoFaVerified: boolean = false;
  QrUrl: string = '';
  private auth: boolean = false;
  private subject = new Subject<any>();

  private apiUrl = 'http://localhost:3000/User';
  private signUpUrl = 'sign-up';
  private signInUrl = 'sign-in';
  private curUser = 'auth/me';
  private intra = '';

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) { }

  getCookie(name: string): string | null {
    
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=`;
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0] || null;
  }

  log_42(): string | null {
    const token = this.getCookie('access_token');
    console.log('cookie: ' + token);
    return (token) ? token : null;
  }

  toggleConnection(user: UserLog): Observable<string> {
    let loginInfo = { email: user.email, password: user.password}
    console.log('sign-in infos: ' + JSON.stringify(loginInfo));
    
    return this.http.post<string>(`${this.apiUrl}/${this.signInUrl}`, JSON.stringify(loginInfo), httpOption);
  }

  logout(id: number) {
    // console.log( 'disconnect: ' + `${this.apiUrl}/${id}`);
    
    this.cookieService.delete('42_token');
    this.cookieService.delete('id_token');
    this.cookieService.deleteAll();
    this.auth = false;
    this.twoFaVerified = false;

    let statInfo = {status: 'OFFLINE'};
    this.updateUser(id, statInfo).pipe(take(1)).subscribe();

    this.router.navigate(['login']).then(() => {
      window.location.reload();
    });
  }

  isLogged(): boolean {
    console.log("log: " + this.auth);

    return this.auth;
  }

  setAuth(auth: boolean) {
    this.auth = auth;
  }

  getUser(auth_token: string): Observable<Info> {
    // console.log(`auth/me req token: ${auth_token}`);
    const headers = new HttpHeaders({
      'X-Skip-Interceptor': 'true',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });
    
    const httpOption = { headers: headers };
    // console.log(`${this.apiUrl}/${this.curUser}`);
    
    return this.http.get<Info>(`${this.apiUrl}/${this.curUser}`, httpOption);
  }

  getUserByName(name: string): Observable<any> {
    // console.log('getUserByName: ' + `${this.apiUrl}/findname/${name}`);
    return this.http.get<any>(`${this.apiUrl}/findname/${name}`);
  }

  getUserById(id: number): Observable<Infos> {
    // console.log('getUserById: ' + `${this.apiUrl}/id/${id}`);
    return this.http.get<Infos>(`${this.apiUrl}/id/${id}`);
  }

  getUserHistory(id: number): Observable<any> {
    console.log('getUserHistory: ' + `http://localhost:3000/historic/${id}`);
    return this.http.get<any>(`http://localhost:3000/historic/${id}`);
  }

  getUsers(): Observable<Infos[]> {
    return this.http.get<Infos[]>(this.apiUrl);
  }

  addUser(user: UserLog): Observable<UserLog> {
    return this.http.post<UserLog>(`${this.apiUrl}/${this.signUpUrl}`, user, httpOption);
  }

  updateUser(id: number, uInfo: any): Observable<any> {
    console.log('updateUser: ' + `${this.apiUrl}/${id}`);
    console.log(JSON.stringify(uInfo));
    
    return this.http.patch(`${this.apiUrl}/${id}`, JSON.stringify(uInfo), httpOption);
  }

  getAvatar(imageName: string): Observable<Blob> {
    console.log(imageName);
    
    return this.http.get(`${this.apiUrl}/url/${imageName}`, {responseType: 'blob'});
  }

  is2FA(): boolean {
    return (this.twoFA);
  }

  setQr(qrUrl: string ) {
    this.QrUrl = qrUrl; 
  }

  getQr() : string {
    return (this.QrUrl);
  }

  get2Fa(auth_token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });
    
    const httpOption = { headers: headers };
    return this.http.get<any>('http://localhost:3000/2fa/enable-2fa', httpOption);
  }

  // New method to verify 2FA token
  verify2FAToken(userId: number, token: string): Observable<any> {

    const body = JSON.stringify({ userId, token });

    return this.http.post<any>('http://localhost:3000/2fa/verify-2fa', body, httpOption);
  }
  
  // New method to verify 2FA token
  disable2FAToken(userId: number, token: string): Observable<any> {
    const body = JSON.stringify({ userId, token });

    return this.http.post<any>('http://localhost:3000/2fa/disable-2fa', body, httpOption);
  }

  enable2FA() {
    this.twoFA = true;
  }

  disable2FA() {
    this.twoFA = false;
  }

  set2FaVer(ver: boolean) {
    this.twoFaVerified = ver;
  }

  is2FaVerified(): boolean {
    return this.twoFaVerified;
  }

}
