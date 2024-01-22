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
    
    if (request.headers.get('X-Skip-Interceptor') === 'true') {
      // console.log('interceptor ignored !');
      
      // Ne pas intercepter la requête, passer au prochain intercepteur
      return next.handle(request);
    }
    
    let auth_token;
    let token = this.uInfoService.getToken('id_token'); // id token a besoin d'un trim special pour etre utiliser
    if (token != '') {
      auth_token = this.uInfoService.trimToken(token);
    } else {
      auth_token = this.uInfoService.getToken('42_token');
    }

    // console.log('interceptor: '+ token);
    


    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${auth_token}`
      }
    });

    return next.handle(modifiedRequest);
  }
}
