import { NgModule } from '@angular/core';

import { AddFeatureComponent } from './add-feature/add-feature.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { AttributelistModule } from './attributelist/attributelist.module';

import { PanelResizerModule } from './panel-resizer/panel-resizer.module';

import { TestAttributeserviceComponent } from './test-attributeservice/test-attributeservice.component';

@NgModule({
  declarations: [
    AddFeatureComponent,
    TestAttributeserviceComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    AttributelistModule,
    PanelResizerModule,
  ],
  exports: [
    AddFeatureComponent,
    MatIconModule,
    TestAttributeserviceComponent,
  ],
  entryComponents: [],
})
export class UserIntefaceModule {
}
