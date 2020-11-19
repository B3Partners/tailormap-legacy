
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { AttributelistFormComponent } from './attributelist-form/attributelist-form.component';
import { AttributelistPanelComponent } from './attributelist-panel/attributelist-panel.component';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';
import { AttributelistTabToolbarComponent } from './attributelist-tab-toolbar/attributelist-tab-toolbar.component';
import { AttributelistTableComponent } from './attributelist-table/attributelist-table.component';
import { AttributelistDetailsComponent } from './attributelist-details/attributelist-details.component';
import { AttributelistTableOptionsFormComponent } from './attributelist-table-options-form/attributelist-table-options-form.component';
import { AttributelistObjectOptionsFormComponent } from './attributelist-object-options-form/attributelist-object-options-form.component';

import { PanelResizerComponent } from '../panel-resizer/panel-resizer.component';
import { DetailsrowDirective } from './attributelist-common/detailsrow.directive';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AttributelistFilterValuesFormComponent } from './attributelist-filter-values-form/attributelist-filter-values-form.component';

@NgModule({
  // The components, directives, and pipes that belong to this NgModule.
  declarations: [
    AttributelistFormComponent,
    AttributelistPanelComponent,
    AttributelistTabComponent,
    AttributelistTabToolbarComponent,
    AttributelistTableComponent,
    AttributelistDetailsComponent,
    AttributelistTableOptionsFormComponent,
    AttributelistObjectOptionsFormComponent,
    DetailsrowDirective,
    PanelResizerComponent,
    AttributelistFilterValuesFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DragDropModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  exports: [
    AttributelistFormComponent,
    AttributelistPanelComponent,
  ],
})
export class AttributelistModule { }
