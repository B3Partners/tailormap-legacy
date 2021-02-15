import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { AttributeListPanelComponent } from './attribute-list-panel/attribute-list-panel.component';
import { AttributeListTabComponent } from './attribute-list-tab/attribute-list-tab.component';
import { AttributeListTabToolbarComponent } from './attribute-list-tab-toolbar/attribute-list-tab-toolbar.component';
import { AttributeListTabContentComponent } from './attribute-list-tab-content/attribute-list-tab-content.component';
import { AttributeListDetailsComponent } from './attribute-list-details/attribute-list-details.component';
import { AttributelistTableOptionsFormComponent } from './attributelist-table-options-form/attributelist-table-options-form.component';

import { PanelResizerComponent } from '../panel-resizer/panel-resizer.component';
import { DetailsrowDirective } from './attributelist-common/detailsrow.directive';

import { AttributelistFilterValuesFormComponent } from './attributelist-filter-values-form/attributelist-filter-values-form.component';
import { AttributelistTreeComponent } from './attributelist-tree/attributelist-tree.component';
import { AttributelistLayernameChooserComponent } from './attributelist-layername-chooser/attributelist-layername-chooser.component';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { AttributeListButtonComponent } from './attribute-list-button/attribute-list-button.component';
import { StoreModule } from '@ngrx/store';
import { attributeListStateKey } from './state/attribute-list.state';
import { attributeListReducer } from './state/attribute-list.reducer';
import { createCustomElement } from '@angular/elements';
import { EffectsModule } from '@ngrx/effects';
import { AttributeListEffects } from './state/attribute-list.effects';
import { AttributeListTableComponent } from './attribute-list-table/attribute-list-table.component';
import { AttributeListCheckboxColumnComponent } from './attribute-list-table/attribute-list-checkbox-column/attribute-list-checkbox-column.component';
import { AttributeListDetailsColumnComponent } from './attribute-list-table/attribute-list-details-column/attribute-list-details-column.component';
import { AttributeListStatisticsMenuComponent } from './attribute-list-table/attribute-list-statistics-menu/attribute-list-statistics-menu.component';
import { AttributeListTreeComponent } from './attribute-list-tree/attribute-list-tree.component';
import { AttributeListTreeDialogComponent } from './attribute-list-tree-dialog/attribute-list-tree-dialog.component';
import { AttributeListColumnSelectionComponent } from './attribute-list-column-selection/attribute-list-column-selection.component';
import { AttributeListFilterComponent } from './attribute-list-filter/attribute-list-filter.component';
import { AttributeListManagerService } from './services/attribute-list-manager.service';

@NgModule({
  // The components, directives, and pipes that belong to this NgModule.
  declarations: [
    AttributeListPanelComponent,
    AttributeListTabComponent,
    AttributeListTabToolbarComponent,
    AttributeListTabContentComponent,
    AttributeListDetailsComponent,
    AttributelistTableOptionsFormComponent,
    DetailsrowDirective,
    PanelResizerComponent,
    AttributelistFilterValuesFormComponent,
    AttributelistTreeComponent,
    AttributelistLayernameChooserComponent,
    AttributeListComponent,
    AttributeListButtonComponent,
    AttributeListTableComponent,
    AttributeListCheckboxColumnComponent,
    AttributeListDetailsColumnComponent,
    AttributeListStatisticsMenuComponent,
    AttributeListTreeComponent,
    AttributeListTreeDialogComponent,
    AttributeListColumnSelectionComponent,
    AttributeListFilterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(attributeListStateKey, attributeListReducer),
    EffectsModule.forFeature([ AttributeListEffects ]),
  ],
  exports: [
    AttributeListPanelComponent,
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
