import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfoService } from 'src/app/services/user-info.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService, private uInfoService: UserInfoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const myObject = {
      token: this.uInfoService.getToken()
    };
    // console.log(myObject.token[1]);
    let auth_token =  JSON.stringify(myObject.token.substring(10 , myObject.token.length - 2));
    auth_token = auth_token.substring(1,auth_token.length-1);
    


    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${auth_token}`
      }
    });

    return next.handle(modifiedRequest);
  }
}
