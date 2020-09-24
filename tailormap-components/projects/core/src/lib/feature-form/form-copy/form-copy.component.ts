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
import { GbiControllerService } from '../../shared/gbi-controller/gbi-controller.service';

@Component({
  selector: 'flamingo-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css']
})
export class FormCopyComponent implements OnInit {

  public destinationFeatures: Feature[];

  public originalFeature: Feature;

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private gbiService: GbiControllerService) {
    this.destinationFeatures = [];
    this.gbiService.addDestinationFeature$.subscribe(value => {
      this.addDestinationFeature(value);
    });
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
