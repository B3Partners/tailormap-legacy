import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AddFeatureComponent } from './add-feature/add-feature.component';
import { AttributelistModule } from './attributelist/attributelist.module';
import { CommonModule } from '@angular/common';
import { PaginatorLabels } from './paginator-labels';
import { SharedModule } from '../shared/shared.module';
import { ChooseTypesComponent } from './sewage/choose-types/choose-types.component';

@NgModule({
  declarations: [
    AddFeatureComponent,
    ChooseTypesComponent,
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
