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
 * Used to set the additional headers fo apis.
 */
@Injectable()
export class AdditionalHeadersInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const authReq = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
    });

    return next.handle(authReq);
  }
}
