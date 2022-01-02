
/**
 * Angular imports.
 */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/**
 * Interceptor imports.
 */
import { AdditionalHeadersInterceptor } from './additional-headers.interceptor';
import { AuthInterceptor } from './auth.interceptor';
import { BaseUrlInterceptor } from './base-url.interceptor';

/**
 * Used to combine the interceptors.
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AdditionalHeadersInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
];
