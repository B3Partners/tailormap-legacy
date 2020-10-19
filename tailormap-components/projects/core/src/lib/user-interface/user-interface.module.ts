import { NgModule } from '@angular/core';

import { AddFeatureComponent } from './add-feature/add-feature.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { TestAttributeserviceComponent } from './test-attributeservice/test-attributeservice.component';
import { ChooseTypesComponent } from './sewage/choose-types/choose-types.component';

@NgModule({
  declarations: [
    AddFeatureComponent,
    TestAttributeserviceComponent,
    ChooseTypesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
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

