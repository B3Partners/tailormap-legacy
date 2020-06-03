import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatDividerModule, MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSliderModule,
  MatStepperModule,
  MatGridListModule,
  MatTabsModule,
  MatTooltipModule,
  MatTreeModule,
  MatDialog,
  MatDialogModule,
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {BASE_PATH} from "./generated";
import {ConfirmDialogService} from "./confirm-dialog/confirm-dialog.service";

@NgModule({
  declarations: [
    ConfirmDialogComponent,],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTreeModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatGridListModule,
    MatSliderModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatListModule,
    HttpClientModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTreeModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatGridListModule,
    MatSliderModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatListModule,
    HttpClientModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  entryComponents:[
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
export class SharedModule { }
