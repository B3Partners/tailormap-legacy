import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../shared/shared.module';
import { FormPopupComponent } from './form-popup/form-popup.component';
import { FormfieldComponent } from './form-field/formfield.component';
import { FormCreatorComponent } from './form-creator/form-creator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiModule } from '../shared/generated';
import { FormTreeComponent } from './form-tree/form-tree.component';
import { UserIntefaceModule } from '../user-interface/user-interface.module';
import { FormCopyComponent } from './form-copy/form-copy.component';
import { CopyCreatorComponent } from './copy-creator/copy-creator.component';

@NgModule({
  declarations: [
    FormComponent,
    FormPopupComponent,
    FormTreeComponent,
    FormfieldComponent,
    FormCreatorComponent,
    FormCopyComponent,
    CopyCreatorComponent,
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
  ],
})
export class FeatureFormModule {
}

