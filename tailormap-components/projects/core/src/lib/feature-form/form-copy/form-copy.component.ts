import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DialogData } from '../form-popup/form-popup-models';
import { Feature } from '../../shared/generated';

@Component({
  selector: 'flamingo-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css']
})
export class FormCopyComponent implements OnInit {

  public destinationFeatures: Feature[];

  public originalFeature: Feature;

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,) {

    this.destinationFeatures = [];

  }

  ngOnInit(): void {
  }

  public cancel() {
    this.destinationFeatures = [];
    this.dialogRef.close();
  }

  public addDestinationFeature(feature: Feature){
    this.destinationFeatures.push(feature);
  }

}
