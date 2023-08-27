import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserInfo, Info, status, Infos } from '../User';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from './log.service';
import { BaseException } from '@angular-devkit/core';


@Injectable({
  providedIn: 'root'
})

export class UserInfoService {
  private apiUrl = 'http://localhost:3000/User';
  
// Les 2 var sont des Subjects, les components doivent s'y abonne pour consommer les valeurs
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>({
    id: 0,
    email: '',
    name: '',
    img: ''
  });

  public uInfo$: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({
    games: 0,
    rank: 0,
    wins: 0,
    looses: 0,
    img: '',
    status: 'ONLINE',
    history: []
  });
  
  constructor(private http:HttpClient, route: ActivatedRoute, private cookieService: CookieService, private logService: LogService) {}
  
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
    
    //Si le token de conneciton est valide: toutes les infos de l'user sont renvoye dans info
    this.logService.getUser(auth_token).subscribe( (info) => {
        //Get User
        this.user$.next({
          id: info.profile.id,
          email: info.profile.email,
          name: info.profile.name,
          img: info.profile.img
        });
        this.user$.subscribe( (user) => (console.log(user)));
        
        //Get UserInfo
        this.uInfo$.next({
          games:  info.profile.games,
          rank: info.profile.rank,
          wins: info.profile.wins,
          looses: info.profile.looses,
          img:  info.profile.img,
          status: info.profile.status,
          history: []
        });
        this.uInfo$.subscribe( (uInfo) => (console.log(uInfo)));

      });
  }

  setUserByName(name: string) {
    this.logService.getUserByName(name).subscribe( (info) => {
      console.log("setByName =>");
      this.setInfo(info);
    });
  }

  private setInfo(infos: Infos) {
    console.log(JSON.stringify(infos));

    console.log(infos.name);
    // //Get User
    this.user$.next({
      id: infos.id,
      email: infos.email,
      name: infos.name,
      img: infos.img
    });
    this.user$.subscribe( (user) => (console.log(user)));
    
    //Get UserInfo
    this.uInfo$.next({
      games:  infos.games,
      rank: infos.rank,
      wins: infos.wins,
      looses: infos.looses,
      img:  infos.img,
      status: infos.status,
      history: []
    });
    this.uInfo$.subscribe( (uInfo) => (console.log(uInfo)));
  }
}
