import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { CoreModule } from 'projects/core/src';
import { WegvakkenFormComponent } from 'projects/core/src/lib/gbi/wegvakken-form/wegvakken-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WegvakPopupComponent } from 'projects/core/src/lib/gbi/wegvak-popup/wegvak-popup.component';
import { MatGridListModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  entryComponents: [
    WegvakPopupComponent,
  ],
  bootstrap: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AppModule {
  constructor(injector: Injector) {
    customElements.define('flamingo-wegvak-popup', createCustomElement(WegvakPopupComponent, {injector}));
  }
  public ngDoBootstrap() {}
}
