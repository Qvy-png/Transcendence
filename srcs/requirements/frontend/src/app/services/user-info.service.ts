import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { User, UserInfo } from '../User';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})

export class UserInfoService {
  private apiUrl = 'https://localhost:3000/User';
  user = <User>{};
  uInfo = <UserInfo>{};
  
  constructor(private http:HttpClient, route: ActivatedRoute, private cookieService: CookieService) {
  }
  
  setEmail(email: string) {
    this.user.email = email;
  }
  
  getUserInfo() {
    
  }
  
  getUser() {
  //   const auth_token = this.cookieService.get('id_token');
  //   console.log(`auth: ${auth_token}`);
  //   const httpOption = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${auth_token}`,
  //     })
  //   }
  //   this.http.get<User>(`${this.apiUrl}/me`, httpOption).subscribe({
  //     next: user => {
  //       this.user = user;
  //       console.log(this.user);
  //     }
  //   });
  }
}
