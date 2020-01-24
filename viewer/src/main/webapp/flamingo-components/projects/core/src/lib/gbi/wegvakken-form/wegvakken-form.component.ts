import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormConfigurations, DialogData, FeatureAttribute, FormConfiguration } from '../../shared/wegvakken-models';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnInit {

  public formConfig: FormConfiguration;

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) { }

  public ngOnInit() {  }

  public closeDialog() {
    this.dialogRef.close();
  }
}
