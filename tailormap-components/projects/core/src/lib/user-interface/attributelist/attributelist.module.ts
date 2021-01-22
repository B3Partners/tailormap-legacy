import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { AttributelistPanelComponent } from './attributelist-panel/attributelist-panel.component';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';
import { AttributelistTabToolbarComponent } from './attributelist-tab-toolbar/attributelist-tab-toolbar.component';
import { AttributelistTableComponent } from './attributelist-table/attributelist-table.component';
import { AttributelistDetailsComponent } from './attributelist-details/attributelist-details.component';
import { AttributelistTableOptionsFormComponent } from './attributelist-table-options-form/attributelist-table-options-form.component';

import { PanelResizerComponent } from '../panel-resizer/panel-resizer.component';
import { DetailsrowDirective } from './attributelist-common/detailsrow.directive';

import { AttributelistFilterValuesFormComponent } from './attributelist-filter-values-form/attributelist-filter-values-form.component';
import { AttributelistTreeComponent } from './attributelist-tree/attributelist-tree.component';
import { AttributelistLayernameChooserComponent } from './attributelist-layername-chooser/attributelist-layername-chooser.component';
import { AttributelistComponent } from './attributelist/attributelist.component';
import { AttributelistButtonComponent } from './attributelist-button/attributelist-button.component';
import { StoreModule } from '@ngrx/store';
import { attributelistStateKey } from './state/attributelist.state';
import { attributelistReducer } from './state/attributelist.reducer';
import { createCustomElement } from '@angular/elements';

@NgModule({
  // The components, directives, and pipes that belong to this NgModule.
  declarations: [
    AttributelistPanelComponent,
    AttributelistTabComponent,
    AttributelistTabToolbarComponent,
    AttributelistTableComponent,
    AttributelistDetailsComponent,
    AttributelistTableOptionsFormComponent,
    DetailsrowDirective,
    PanelResizerComponent,
    AttributelistFilterValuesFormComponent,
    AttributelistTreeComponent,
    AttributelistLayernameChooserComponent,
    AttributelistComponent,
    AttributelistButtonComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(attributelistStateKey, attributelistReducer),
  ],
  exports: [
    AttributelistPanelComponent,
  ],
})
export class AttributelistModule {
  public constructor(injector: Injector) {
    customElements.define('tailormap-attributelist-button',
      createCustomElement(AttributelistButtonComponent, {injector}));
    customElements.define('tailormap-attributelist',
      createCustomElement(AttributelistComponent, {injector}));
  }
}
