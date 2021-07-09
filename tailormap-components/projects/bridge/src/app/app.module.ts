import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app.component';
import { CoreModule } from 'projects/core/src';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkflowControllerComponent } from '../../../core/src/lib/workflow/workflow-controller/workflow-controller.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { ThirdPartyComponentsModule } from 'projects/third-party-components/src';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    ThirdPartyComponentsModule,
    BrowserAnimationsModule,
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
  ],
  providers: [
  ],
  entryComponents: [
    WorkflowControllerComponent,
  ],
  bootstrap: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AppModule {
  constructor(injector: Injector) {
    customElements.define('tailormap-workflow-controller', createCustomElement(WorkflowControllerComponent, {injector}));
  }
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  public ngDoBootstrap() {}
}
