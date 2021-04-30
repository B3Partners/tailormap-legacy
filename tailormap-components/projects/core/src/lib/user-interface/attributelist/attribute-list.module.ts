import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { AttributeListTabComponent } from './attribute-list-tab/attribute-list-tab.component';
import { AttributeListTabToolbarComponent } from './attribute-list-tab-toolbar/attribute-list-tab-toolbar.component';
import { AttributeListDetailsComponent } from './attribute-list-details/attribute-list-details.component';
import { PanelResizerComponent } from '../panel-resizer/panel-resizer.component';
import { AttributeListLayernameChooserComponent } from './attribute-list-layername-chooser/attribute-list-layername-chooser.component';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { AttributeListButtonComponent } from './attribute-list-button/attribute-list-button.component';
import { StoreModule } from '@ngrx/store';
import { attributeListStateKey } from './state/attribute-list.state';
import { attributeListReducer } from './state/attribute-list.reducer';
import { createCustomElement } from '@angular/elements';
import { EffectsModule } from '@ngrx/effects';
import { AttributeListEffects } from './state/attribute-list.effects';
import { AttributeListContentComponent } from './attribute-list-content/attribute-list-content.component';
import { AttributeListTreeComponent } from './attribute-list-tree/attribute-list-tree.component';
import { AttributeListTreeDialogComponent } from './attribute-list-tree-dialog/attribute-list-tree-dialog.component';
import { AttributeListColumnSelectionComponent } from './attribute-list-column-selection/attribute-list-column-selection.component';
import { AttributeListFilterComponent } from './attribute-list-filter/attribute-list-filter.component';
import { AttributeListManagerService } from './services/attribute-list-manager.service';
import { AttributeListTableComponent } from './attribute-list-table/attribute-list-table.component';

@NgModule({
  declarations: [
    AttributeListTabComponent,
    AttributeListTabToolbarComponent,
    AttributeListDetailsComponent,
    PanelResizerComponent,
    AttributeListLayernameChooserComponent,
    AttributeListComponent,
    AttributeListButtonComponent,
    AttributeListContentComponent,
    AttributeListTreeComponent,
    AttributeListTreeDialogComponent,
    AttributeListColumnSelectionComponent,
    AttributeListFilterComponent,
    AttributeListTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(attributeListStateKey, attributeListReducer),
    EffectsModule.forFeature([ AttributeListEffects ]),
  ],
})
export class AttributeListModule {
  public constructor(
    injector: Injector,
    // Service is instantiated here, watches changes to visible layers to create tabs
    public attributeListManagerService: AttributeListManagerService,
  ) {
    customElements.define('tailormap-attribute-list-button',
      createCustomElement(AttributeListButtonComponent, {injector}));
    customElements.define('tailormap-attribute-list',
      createCustomElement(AttributeListComponent, {injector}));
  }
}
