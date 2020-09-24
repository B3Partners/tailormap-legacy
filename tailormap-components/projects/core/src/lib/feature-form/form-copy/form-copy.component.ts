import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { CopyData } from '../form-popup/form-popup-models';
import { Feature } from '../../shared/generated';
import { GbiControllerService } from '../../shared/gbi-controller/gbi-controller.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { FormConfiguration } from '../form/form-models';

@Component({
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit {

  public destinationFeatures: Feature[];

  public originalFeature: Feature;

  public formConfig: FormConfiguration;

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CopyData,
              private gbiService: GbiControllerService,
              private configService: FormconfigRepositoryService) {
    this.destinationFeatures = [];
    this.gbiService.addDestinationFeature$.subscribe(value => {
      this.addDestinationFeature(value);
    });
  }

  public ngOnInit(): void {
    this.originalFeature = this.data.feature;
    this.formConfig = this.configService.getFormConfig(this.data.feature.clazz);
  }

  public cancel() {
    this.destinationFeatures = [];
    this.dialogRef.close();
  }

  public addDestinationFeature(feature: Feature) {
    this.destinationFeatures.push(feature);
  }

}
