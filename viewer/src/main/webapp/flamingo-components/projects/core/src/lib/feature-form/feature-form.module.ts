import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../shared/shared.module';
import { FormPopupComponent } from './form-popup/form-popup.component';

import { FormfieldComponent } from './form-field/formfield.component';
import { FormCreatorComponent } from './form-creator/form-creator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import {ApiModule, BASE_PATH} from "../shared/generated";
import {FormTreeComponent} from "./form-tree/form-tree.component";



@NgModule({
  declarations: [
    FormComponent,
    FormPopupComponent,
    FormTreeComponent,
    FormfieldComponent,
    FormCreatorComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ApiModule,
  ],
  exports: [
    FormPopupComponent,
  ],
  entryComponents: [
    FormComponent,
    ConfirmDialogComponent,
  ],
  providers: [
    ConfirmDialogService,
    {
      provide: BASE_PATH,
      useFactory: ()=>{
        return window.location.origin + '/form-api';
      }
    },
  ],
})
export class FeatureFormModule { }

