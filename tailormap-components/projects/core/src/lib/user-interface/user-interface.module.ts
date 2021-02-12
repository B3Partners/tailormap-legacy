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
import { GeometryConfirmButtonsComponent } from './geometry-confirm-buttons/geometry-confirm-buttons.component';
import { InputFieldComponent } from './generic-components/input-field/input-field.component';
import { BaseFieldComponent } from './generic-components/base-field/base-field.component';
import { LabelFieldComponent } from './generic-components/label-field/label-field.component';

@NgModule({
  declarations: [
    MenuButtonComponent,
    ChooseTypesComponent,
    EditBarComponent,
    AddFeatureMenuComponent,
    GeometryConfirmButtonsComponent,
    InputFieldComponent,
    BaseFieldComponent,
    LabelFieldComponent,
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
        GeometryConfirmButtonsComponent,
        InputFieldComponent,
        LabelFieldComponent,
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
