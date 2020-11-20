import {
  Injector,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisButtonComponent } from './analysis-button/analysis-button.component';
import { createCustomElement } from '@angular/elements';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { analysisStateKey } from './state/analysis.state';
import { analysisReducer } from './state/analysis.reducer';
import { CreateLayerPanelComponent } from './create-layer-panel/create-layer-panel.component';
import { CreateLayerFormComponent } from './create-layer-form/create-layer-form.component';
import { CreateLayerStylingComponent } from './create-layer-styling/create-layer-styling.component';


@NgModule({
  declarations: [
    AnalysisButtonComponent,
    CreateLayerPanelComponent,
    CreateLayerFormComponent,
    CreateLayerStylingComponent,
  ],
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
    customElements.define('tailormap-create-layer-panel',
      createCustomElement(CreateLayerPanelComponent, {injector}));
  }
}
