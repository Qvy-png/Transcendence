import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    // Accédez aux en-têtes de la requête
    const headers = req.headers;
    
    console.log('Requête reçue :', req.url);
    console.log('En-têtes de la requête :', headers);

    return next.handle().pipe(
      tap(() => {
        console.log('Requête terminée');
      }),
    );
  }
}
