/**============================================================================
 *===========================================================================*/

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { PanelResizerComponent } from './panel-resizer.component';

@NgModule({
  declarations: [
    PanelResizerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    PanelResizerComponent,
  ]
})
export class PanelResizerModule { }
