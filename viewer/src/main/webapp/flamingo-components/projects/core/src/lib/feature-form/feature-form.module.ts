import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {SharedModule} from '../shared/shared.module';
import {FormPopupComponent} from './form-popup/form-popup.component';
import {FormfieldComponent} from './form-field/formfield.component';
import {FormCreatorComponent} from './form-creator/form-creator.component';
import {ReactiveFormsModule} from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {ApiModule} from "../shared/generated";
import {FormTreeComponent} from "./form-tree/form-tree.component";
import {UserIntefaceModule} from "../user-interface/user-interface.module";

@NgModule({
  declarations: [
    FormComponent,
    FormPopupComponent,
    FormTreeComponent,
    FormfieldComponent,
    FormCreatorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ApiModule,
    UserIntefaceModule,

  ],
  exports: [
    FormPopupComponent,
    FormComponent,
  ],
  entryComponents: [
    FormComponent,
  ]
})
export class FeatureFormModule {
}

