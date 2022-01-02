/**
 * Angular imports.
 */
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

/**
 * Rxjs imports.
 */
import { Observable } from 'rxjs';

/**
 * Environment imports.
 */
import { environment } from './../../environments/environment';

/**
 * Used to set the Authorization headers.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const authReq = request.clone({
      headers: request.headers.set('Authorization', 'Basic ' + btoa(environment.username + ':' + environment.password))
    });

    return next.handle(authReq);
  }
}
