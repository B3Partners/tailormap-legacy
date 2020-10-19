import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app.component';
import { CoreModule } from 'projects/core/src';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkflowControllerComponent } from '../../../core/src/lib/workflow/workflow-controller/workflow-controller.component';
import { AttributelistFormComponent } from 'projects/core/src/lib/user-interface/attributelist/attributelist-form/attributelist-form.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
  ],
  providers: [
  ],
  entryComponents: [
    AttributelistFormComponent,
    WorkflowControllerComponent,
  ],
  bootstrap: [],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AppModule {
  constructor(injector: Injector) {
    customElements.define('tailormap-attributelist-form',
                           createCustomElement(AttributelistFormComponent, {injector}));
    customElements.define('tailormap-workflow-controller', createCustomElement(WorkflowControllerComponent, {injector}));
  }
  public ngDoBootstrap() {}
}
