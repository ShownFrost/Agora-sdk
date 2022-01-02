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
import { environment } from '../../environments/environment';

/**
 * Create for set base url.
 */
@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = request.clone({
      url: environment.agoraUrl + request.url
    });
    return next.handle(authReq);
  }
}
