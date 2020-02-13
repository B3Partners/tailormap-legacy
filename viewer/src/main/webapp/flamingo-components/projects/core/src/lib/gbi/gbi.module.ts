import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WegvakkenFormComponent } from './wegvakken-form/wegvakken-form.component';
import { SharedModule } from '../shared/shared.module';
import { WegvakPopupComponent } from './wegvak-popup/wegvak-popup.component';
import { WegvakkenTreeComponent } from './wegvakken-tree/wegvakken-tree.component';
import { WegvakFormfieldComponent } from './wegvak-formfield/wegvak-formfield.component';
import { WegvakkenFormCreatorComponent } from './wegvakken-form-creator/wegvakken-form-creator.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';



@NgModule({
  declarations: [
    WegvakkenFormComponent,
    WegvakPopupComponent,
    WegvakkenTreeComponent,
    WegvakFormfieldComponent,
    WegvakkenFormCreatorComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  exports: [
    WegvakPopupComponent,
  ],
  entryComponents: [
    WegvakkenFormComponent,
    ConfirmDialogComponent,
  ],
  providers: [
    ConfirmDialogService,
  ],
})
export class GbiModule { }
