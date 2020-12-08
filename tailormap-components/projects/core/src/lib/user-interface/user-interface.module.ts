import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AttributelistModule } from './attributelist/attributelist.module';
import { CommonModule } from '@angular/common';
import { PaginatorLabels } from './paginator-labels';
import { SharedModule } from '../shared/shared.module';
import { ChooseTypesComponent } from './sewage/choose-types/choose-types.component';
import { EditBarComponent } from './edit-bar/edit-bar/edit-bar.component';
import { AddFeatureMenuComponent } from './edit-bar/add-feature-menu/add-feature-menu.component';
import { MenuButtonComponent } from './edit-bar/add-feature-menu/menu-button/menu-button.component';

@NgModule({
  declarations: [
    MenuButtonComponent,
    ChooseTypesComponent,
    EditBarComponent,
    AddFeatureMenuComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    AttributelistModule,
  ],
  exports: [
    MatIconModule,
    EditBarComponent,
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
