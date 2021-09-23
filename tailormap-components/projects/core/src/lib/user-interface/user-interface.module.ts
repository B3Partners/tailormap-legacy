import { Injector, NgModule } from '@angular/core';

import { MatPaginatorIntl } from '@angular/material/paginator';

import { AttributeListButtonComponent, AttributeListComponent, AttributeListModule } from '@tailormap/core-components';
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
import { createCustomElement } from '@angular/elements';
import { DatepickerFieldComponent } from './generic-components/datepicker-field/datepicker-field.component';
import { CheckboxFieldComponent } from './generic-components/checkbox-field/checkbox-field.component';
import { SelectFieldComponent } from './generic-components/select-field/select-field.component';

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
    DatepickerFieldComponent,
    CheckboxFieldComponent,
    SelectFieldComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AttributeListModule,
  ],
  exports: [
    EditBarComponent,
    GeometryConfirmButtonsComponent,
    InputFieldComponent,
    LabelFieldComponent,
    DatepickerFieldComponent,
    CheckboxFieldComponent,
    SelectFieldComponent,
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
  public constructor(
    injector: Injector,
  ) {
    customElements.define('tailormap-attribute-list-button',
      createCustomElement(AttributeListButtonComponent, {injector}));
    customElements.define('tailormap-attribute-list',
      createCustomElement(AttributeListComponent, {injector}));
  }
}
