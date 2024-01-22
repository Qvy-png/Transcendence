import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable, Subject, map, take } from 'rxjs';
import { User, UserInfo, Info, Status, Infos } from '../User';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from './log.service';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
}

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
    id: 0,
    games: 0,
    rank: 0,
    wins: 0,
    looses: 0,
    img: '',
    status: 'ONLINE',
    historicGameID: [],
    friendList: [],
    pendingRequest: [],
    blockedUsers: [],
    twoFactor: false,
    twoFactorSecret: '',
    conversationList: []
  });

  constructor(private http:HttpClient, route: ActivatedRoute, private cookieService: CookieService, private logService: LogService) {
  }

  setToken(key: string, token: string) {
    this.cookieService.set(key, token);
  }

  getToken(key: string): string {
    return this.cookieService.get(key);
  }

  trimToken(token: string): string {
    let auth_token = JSON.stringify(token.substring(10 , token.length - 2));
    auth_token = auth_token.substring(1,auth_token.length-1);

    return auth_token;
  }

  isCurUserProfile(id: number): Observable<boolean> {
    return this.user$.pipe(
      map(user => {
        
        return (user.id == id)
      })
    );
  }
  
  getCurUserId(): Observable<number> {
    return this.user$.pipe(
      map(user => {
        console.log('curId: ' + user.id);
        return user.id;
      })
    );
  }

  /** Verifie que la target n'a pas bloque le current user */
  isBlocked(targetId: number): Observable<boolean> {
    let curId!: number;
    this.user$.subscribe(user => curId = user.id);

    var subject = new Subject<boolean>();

    this.logService.getUserById(targetId).subscribe({
      next: (target) => {
        if (target.blockedUsers) {
          if (target.blockedUsers.indexOf(curId) != -1) {
            alert(target.name + ' has blocked you !');
            subject.next(true);
          } else {
            subject.next(false);
          }
        } else {
          subject.next(false);
        }
      }
    });

    return (subject.asObservable());
  }

  // this.uInfoService.isBlocked(this.id).subscribe( (value) => {
  //   if (!value) {
  //     this.route.navigate(['profile'], { queryParams: {id: this.id} });
  //   }
  // });

  setUser() {
    const myObject = {
      token: this.getToken('id_token')
    };
    // console.log('set User token: '+ myObject.token);
    let auth_token =  JSON.stringify(myObject.token.substring(10 , myObject.token.length - 2));
    auth_token = auth_token.substring(1,auth_token.length-1);

    this.getInfo(auth_token).pipe(take(1)).subscribe();
  }

  getInfo(auth_token: string): Observable<any> {
    return new Observable<any>((observer) => {
      // console.log("getInfo: auth token` : " , auth_token);
      //Si le token de connection est valide: toutes les infos de l'user sont renvoye dans info
      this.logService.getUser(auth_token).pipe(take(1)).subscribe( (info) => {
          //Get User
          // console.log(JSON.stringify(info));
          this.user$.next({
            id: info.profile.id,
            email: info.profile.email,
            name: info.profile.name,
            img: info.profile.img
          });
          // this.user$.subscribe( (user) => (console.log(user)));

          //Get UserInfo
          this.uInfo$.next({
            id: info.profile.id,
            games:  info.profile.games,
            rank: info.profile.rank,
            wins: info.profile.wins,
            looses: info.profile.looses,
            img:  info.profile.img,
            status: info.profile.status,
            historicGameID: (info.profile.historicGameID) ? info.profile.historicGameID : [],
            friendList: (info.profile.friendList) ? info.profile.friendList : [],
            pendingRequest: (info.profile.pendingRequest) ? info.profile.pendingRequest : [],
            blockedUsers: (info.profile.blockedUsers) ? info.profile.blockedUsers : [],
            twoFactor: info.profile.twoFactor,
            twoFactorSecret: info.profile.twoFactorSecret,
            conversationList: (info.profile.conversationList) ? info.profile.conversationList : []
          });

          const guardInfo = {
            id: info.profile.id,
            name: info.profile.name,
            twoFactor: info.profile.twoFactor
          }
          // console.log(guardInfo);
          
          console.log('getInfo done init !');
          observer.next(guardInfo);
          observer.complete();
      }, error => {
        return (error);
      });
    });
  }

  loadUser(id: number): Observable<void> {
		return new Observable<void>((observer) => {
		  console.log('loading User: ' + id);
		  
			let auth_token;
			let token = this.getToken('id_token');
			if (token != '') {
				auth_token = this.trimToken(token);
			} else {
				auth_token = this.getToken('42_token');
			}

		  this.logService.getUser(auth_token).subscribe( (value) => {
        this.user$.next({
          id: value.profile.id,
				  email: value.profile.email,
				  name: value.profile.name,
				  img: value.profile.img
				});
        
        this.uInfo$.next({
          id:  value.profile.id,
				  games:   value.profile.games,
				  rank:  value.profile.rank,
				  wins:  value.profile.wins,
				  looses:  value.profile.looses,
				  img:   value.profile.img,
				  status:  (value.profile.status) ? value.profile.status : 'ONLINE',
				  historicGameID:  (value.profile.historicGameID) ? value.profile.historicGameID : [],
				  friendList:  (value.profile.friendList) ? value.profile.friendList : [],
          pendingRequest:  (value.profile.pendingRequest) ? value.profile.pendingRequest : [],
          blockedUsers: (value.profile.blockedUsers) ? value.profile.blockedUsers : [],
          twoFactor: value.profile.twoFactor,
          twoFactorSecret: value.profile.twoFactorSecret,
          conversationList: (value.profile.conversationList) ? value.profile.conversationList : []
        });
      // Émettre une valeur lorsque le chargement est terminé
        observer.next();
        observer.complete();
    });
	});
}


}
