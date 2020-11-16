import {
  Injector,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisButtonComponent } from './analysis-button/analysis-button.component';
import { createCustomElement } from '@angular/elements';
import { SharedModule } from '../shared/shared.module';
import { AnalysisFormComponent } from './analysis-form/analysis-form.component';
import { StoreModule } from '@ngrx/store';
import { analysisStateKey } from './state/analysis.state';
import { analysisReducer } from './state/analysis.reducer';


@NgModule({
  declarations: [AnalysisButtonComponent, AnalysisFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(analysisStateKey, analysisReducer),
  ],
})
export class AnalysisModule {
  public constructor(injector: Injector) {
    customElements.define('tailormap-analysis-button',
      createCustomElement(AnalysisButtonComponent, {injector}));
  }
}
