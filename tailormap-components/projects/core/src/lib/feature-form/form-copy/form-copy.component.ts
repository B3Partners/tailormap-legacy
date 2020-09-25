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
import { FormActionsService } from '../form-actions/form-actions.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit {

  public destinationFeatures: Feature[];

  public originalFeature: Feature;

  public formConfig: FormConfiguration;

  public fieldsToCopy = new Map<string, string>();

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CopyData,
              private gbiService: GbiControllerService,
              private configService: FormconfigRepositoryService,
              private actionService: FormActionsService,
              private _snackBar: MatSnackBar) {
    this.destinationFeatures = [];
    this.gbiService.addDestinationFeature$.subscribe(value => {
      this.addDestinationFeature(value);
    });
  }

  public ngOnInit(): void {
    this.originalFeature = this.data.feature;
    this.formConfig = this.configService.getFormConfig(this.data.feature.clazz);
    for (const field of this.formConfig.fields) {
      this.fieldsToCopy.set(field.key, field.label);
    }
  }

  public cancel() {
    this.destinationFeatures = [];
    this.dialogRef.close();
  }

  public copy() {
    let successCopied = 0;
    if (this.destinationFeatures.length > 0) {
      const valuesToCopy = this.getPropertiesToMerge();
      for (let i  = 0; i <= this.destinationFeatures.length - 1; i++) {
        this.destinationFeatures[i] = {...this.destinationFeatures[i], ...valuesToCopy};
        this.actionService.save$(false, this.destinationFeatures[i], this.destinationFeatures[i]).subscribe(savedFeature => {
            successCopied++;
            if (successCopied === this.destinationFeatures.length) {
              this._snackBar.open('Er zijn ' + successCopied + 'features gekopieerd', '', {
                duration: 5000,
              });
              this.destinationFeatures = [];
              this.dialogRef.close();
            }
          },
          error => {
            this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
              duration: 5000,
            });
          });
      }
    }
    this._snackBar.open('Er zijn geen objecten geselecteerd!', '', {
      duration: 5000,
    });
  }

  public addDestinationFeature(feature: Feature) {
    this.destinationFeatures.push(feature);
  }

  public stringToNumber(key: string) {
    return Number(key);
  }

  public updateFieldToCopy(event: any) {
    if (!event.checked) {
      if (this.fieldsToCopy.has(event.source.id)) {
        this.fieldsToCopy.delete(event.source.id);
      }
    } else {
      if (!this.fieldsToCopy.has(event.source.id)) {
        this.fieldsToCopy.set(event.source.id, event.source.name);
      }
    }
  }

  private getPropertiesToMerge(): any {
    const valuesToCopy = {};
    this.fieldsToCopy.forEach((value, key) => {
      valuesToCopy[key] = this.originalFeature[key];
    })
    return valuesToCopy;
  }

}
