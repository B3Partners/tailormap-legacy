import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ConfigModule } from "../config/config.module";
import { CONFIG_SERVICE_BASE_PATH, ConfigModule as CoreConfigModule } from "@tailormap/config";
import { environment } from "../environments/environment";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "@tailormap/shared";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    HttpClientModule,
    SharedModule,
    CoreConfigModule,
    ConfigModule,
  ],
  providers: [
    { provide: CONFIG_SERVICE_BASE_PATH, useValue: environment.contextPath }
  ],
})
export class AppModule {
  public ngDoBootstrap(){}
}
