import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { User, UserInfo, Info } from '../User';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from './log.service';


@Injectable({
  providedIn: 'root'
})

export class UserInfoService {
  private apiUrl = 'http://localhost:3000/User';
  user = <User>{};
  uInfo = <UserInfo>{};
  
  constructor(private http:HttpClient, route: ActivatedRoute, private cookieService: CookieService, private logService: LogService) {
  }
  
  setEmail(email: string) {
    this.user.email = email;
  }
  
  setToken(token: string) {
    this.cookieService.set('id_token', token);
  }

  getToken(): string {
    return this.cookieService.get('id_token');
  }

  setUser() {
    const myObject = {
      token: this.getToken()
    }
    let auth_token =  JSON.stringify(myObject.token.substring(10 , myObject.token.length - 2));

    console.log("auth token set user : " , auth_token);

    this.logService.getUser(auth_token).subscribe( (info) => {

    });

  }
}
