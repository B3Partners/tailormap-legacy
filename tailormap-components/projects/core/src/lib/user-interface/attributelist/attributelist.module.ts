/**============================================================================
 *===========================================================================*/

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { PanelResizerModule } from '../panel-resizer/panel-resizer.module';

import { AttributelistFormComponent } from './attributelist-form/attributelist-form.component';
import { AttributelistPanelComponent } from './attributelist-panel/attributelist-panel.component';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';
import { AttributelistTabTbComponent } from './attributelist-tab-tb/attributelist-tab-tb.component';
import { AttributelistTableComponent } from './attributelist-table/attributelist-table.component';
import { AttributelistTableOptionsFormComponent } from './attributelist-table-options-form/attributelist-table-options-form.component';
import { AttributelistObjectOptionsFormComponent } from './attributelist-object-options-form/attributelist-object-options-form.component';

//import { TestModule } from '../test/test.module';

@NgModule({
  // The components, directives, and pipes that belong to this NgModule.
  declarations: [
    AttributelistFormComponent,
    AttributelistPanelComponent,
    AttributelistTabComponent,
    AttributelistTabTbComponent,
    AttributelistTableComponent,
    AttributelistTableOptionsFormComponent,
    AttributelistObjectOptionsFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PanelResizerModule,
  ],
  exports: [
    AttributelistFormComponent,
    AttributelistPanelComponent,
    AttributelistTabComponent,
    AttributelistTabTbComponent,
    AttributelistTableComponent,
  ]
})
export class AttributelistModule { }
