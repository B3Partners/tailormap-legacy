import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AddFeatureComponent } from './add-feature/add-feature.component';
import { AttributelistModule } from './attributelist/attributelist.module';
import { CommonModule } from '@angular/common';
import { PaginatorLabels } from './paginator-labels';
import { SharedModule } from '../shared/shared.module';
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
  ],
  exports: [
    AddFeatureComponent,
    MatIconModule,
    TestAttributeserviceComponent,
  ],
  entryComponents: [],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: PaginatorLabels,
    },
  ],
})
export class UserIntefaceModule {
}
