import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, pipe, map, take, from, of } from 'rxjs';
import { LogService } from './log.service';
import { UserInfoService } from './user-info.service';
import { resolve } from '@angular-devkit/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private router: Router, private logService: LogService, private uInfoService: UserInfoService) {}

  whereId?: boolean; // true if id_token; false if 42_token
  twoFa: boolean = false;
  curId!: number;
  // isAuthGuardRunning = false;
  url: string = this.router.url.split('?')[0];

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

      // Vérifie si l'AuthGuard est déjà en cours d'exécution
      // if (this.isAuthGuardRunning) {
      //   console.log('AuthGuard is already running. Exiting to prevent recursion.');
      //   return false; // Ou retournez une UrlTree appropriée si vous souhaitez rediriger
      // }      
      // this.isAuthGuardRunning = true;

      console.log('--- AUTH GUARD VERIF ---');
      console.log('on: ' + this.router.url); //TODO deny access profile manually

      let auth_token: string;
      let token = this.uInfoService.getToken('id_token');
      if (token != '') {
        auth_token = this.uInfoService.trimToken(token);
        this.whereId = true;
      } else {
        auth_token = this.uInfoService.getToken('42_token');
        this.whereId = false;
      }

      if (!auth_token) {
        console.log('AUTH: NOT loggedIn !');
        this.router.navigateByUrl('/login');
        return (false);
      }
      console.log('before');
      
      // return this.router.navigate(['twoFaLog'], { queryParams: { id: this.curId } });
      
      return new Observable<boolean | UrlTree>((observer) => {
        this.uInfoService.getInfo(auth_token).pipe(take(1)).subscribe((guardInfo) => {
          this.twoFa = guardInfo.twoFactor;
          this.curId = guardInfo.id;
        
          console.log('---');
          console.log('2fa: ' + this.twoFa + ' id: ' + this.curId);
          console.log('ver: ' + this.logService.is2FaVerified());
          console.log('---');

          if (!this.twoFa) {
            console.log('2fa Not activated');
            
            // this.router.navigate(['']);
            observer.next(true);
            observer.complete();
          } else if (this.twoFa && this.logService.is2FaVerified()) {
            console.log('AUTH: OK 2Fa');
            // this.router.navigate(['']);
            observer.next(true);
            observer.complete();
          } else {
            console.log('AUTH: 2FA needed !');
            // observer.next(this.router.createUrlTree(['twoFaLog'], { queryParams: { id: this.curId } }));
            this.router.navigate(['/twoFaLog'], { queryParams: { id: this.curId } });
            observer.next(false);
            // if (this.url == 'twoFaLog') {
            //   observer.next(true);
            // } else {
            //   observer.next(false);
            // }
            observer.complete();
          }
        });
        // this.isAuthGuardRunning = false;
      });
  }
}



// if (auth_token) {
//   this.uInfoService.getInfo(auth_token);
//   this.uInfoService.uInfo$.subscribe((user) => {this.twoFa = user.twoFactor; this.curId = user.id});
// }
// console.log('2fa: ' + this.twoFa + ' id: ' + this.curId);
// console.log('ver: ' + this.logService.is2FaVerified());

// if (this.twoFa ) { //&& !this.logService.is2FaVerified()
//   console.log('AUTH: 2FA needed !');
//   return this.router.navigate(['twoFaLog'], { queryParams: {id: this.curId} });
// }