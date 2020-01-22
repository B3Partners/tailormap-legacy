import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../wegvak-popup/wegvak-popup.component';

@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) { }

  public ngOnInit() {
  }
  public closeDialog() {
    this.dialogRef.close();
  }
}
