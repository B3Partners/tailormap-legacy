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
import { CreateLayerLayerSelectionComponent } from './create-layer-layer-selection/create-layer-layer-selection.component';
import { ApplicationModule } from '../application/application.module';
import { CriteriaComponent } from './criteria/criteria/criteria.component';
import { SimpleCriteriaComponent } from './criteria/simple-criteria/simple-criteria.component';
import { AdvancedCriteriaComponent } from './criteria/advanced-criteria/advanced-criteria.component';
import { CriteriaGroupComponent } from './criteria/criteria-group/criteria-group.component';


@NgModule({
  declarations: [
    AnalysisButtonComponent,
    CreateLayerPanelComponent,
    CreateLayerFormComponent,
    CreateLayerStylingComponent,
    CreateLayerLayerSelectionComponent,
    CriteriaComponent,
    SimpleCriteriaComponent,
    AdvancedCriteriaComponent,
    CriteriaGroupComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApplicationModule,
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
