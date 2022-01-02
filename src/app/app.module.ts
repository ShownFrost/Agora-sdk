/**
 * Angular imports.
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/**
 * Component imports.
 */
import { AppComponent } from './app.component';

/**
 * Module imports.
 */
import { AppRoutingModule } from './app-routing.module';

/**
 * Interceptor imports.
 */
import { httpInterceptorProviders } from './httpInterceptors';

/**
 * Service imports.
 */
import { ApiService } from 'src/app/services/api/api.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
