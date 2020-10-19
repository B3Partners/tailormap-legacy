/* tslint:disable:no-string-literal */
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { Feature } from '../../shared/generated';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import {
  DialogData,
  FormConfiguration,
} from '../form/form-models';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkflowControllerService } from '../../workflow/workflow-controller/workflow-controller.service';

@Component({
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit {

  public originalFeature: Feature;

  public formConfig: FormConfiguration;

  public featuresToCopy = new Map<number, Map<string, string>>();

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public controller: WorkflowControllerService,
              private configService: FormconfigRepositoryService,
              private actionService: FormActionsService,
              private _snackBar: MatSnackBar,
              private formConfigRepo: FormconfigRepositoryService) {
  }

  public ngOnInit(): void {
    this.originalFeature = this.data.formFeatures[0];
    this.formConfig = this.configService.getFormConfig(this.data.formFeatures[0].clazz);
    const fieldsToCopy = new Map<string, string>();
    for (const field of this.formConfig.fields) {
      fieldsToCopy.set(field.key, field.label);
    }
    this.featuresToCopy.set(this.originalFeature['fid'], fieldsToCopy);
    if (this.originalFeature.children) {
      for (const child of this.originalFeature.children) {
        const config = this.configService.getFormConfig(child.clazz);
        if (config) {
          // tslint:disable-next-line:no-shadowed-variable
          const fieldsToCopy = new Map<string, string>();
          for (const field of config.fields) {
            fieldsToCopy.set(field.key, field.label);
          }
          this.featuresToCopy.set(child.fid, fieldsToCopy);
        }
      }
    }
  }

  public cancel() {
    this.controller.init();
    this.dialogRef.close();
  }

  public copy() {
    let successCopied = 0;
    const destinationFeatures = this.controller.getDestinationFeatures();
    if (destinationFeatures.length > 0) {
      const valuesToCopy = this.getPropertiesToMerge();
      for (let i  = 0; i <= destinationFeatures.length - 1; i++) {
        destinationFeatures[i] = {...destinationFeatures[i], ...valuesToCopy};
        this.actionService.save$(false, destinationFeatures[i], destinationFeatures[i]).subscribe(savedFeature => {
            successCopied++;
            if (successCopied === destinationFeatures.length) {
              this._snackBar.open('Er zijn ' + successCopied + ' features gekopieerd', '', {
                duration: 5000,
              });
              this.controller.init();
              this.dialogRef.close();
            }
          },
          error => {
            this.controller.init();
            this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
              duration: 5000,
            });
          });
      }
    } else {
      this._snackBar.open('Er zijn geen objecten geselecteerd!', '', {
        duration: 5000,
      });
    }
  }

  public stringToNumber(key: string) {
    return Number(key);
  }

  public updateFieldToCopy(event: any) {
    if (!event.checked) {
      if (this.featuresToCopy.has(this.originalFeature['fid'])) {
        const fieldsToCopy = this.featuresToCopy.get(this.originalFeature['fid']);
        if (fieldsToCopy.has(event.source.id)) {
          fieldsToCopy.delete(event.source.id);
        }
      }
    } else {
      if (this.featuresToCopy.has(this.originalFeature['fid'])) {
        const fieldsToCopy = this.featuresToCopy.get(this.originalFeature['fid']);
        fieldsToCopy.set(event.source.id, event.source.name);
      }
    }
  }

  private getPropertiesToMerge(): any {
    const valuesToCopy = {};

    // this.fieldsToCopy.forEach((value, key) => {
    //  valuesToCopy[key] = this.originalFeature[key];
    // })
    return valuesToCopy;
  }

  public openForm(feature) {
    if (feature) {
        this.originalFeature = feature;
        this.formConfig = this.formConfigRepo.getFormConfig(this.originalFeature.clazz);
    }
  }


}
