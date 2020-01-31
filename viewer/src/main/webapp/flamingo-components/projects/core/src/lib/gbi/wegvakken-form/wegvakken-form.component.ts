import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, Feature, FormConfiguration } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnInit {

  public feature: Feature;
  public formConfig: FormConfiguration;

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData ) {
      this.formConfig = data.formConfigs.config[data.formFeature.featureType];
      this.feature = data.formFeature;
  }

  public ngOnInit() {
  }

  public closeDialog() {
    this.dialogRef.close();
  }
}
