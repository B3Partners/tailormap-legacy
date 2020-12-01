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
  FormConfiguration,
} from '../form/form-models';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CopyDialogData } from './form-copy-models';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { FormCopyService } from './form-copy.service';

@Component({
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit {

  private width = '400px';

  public originalFeature: Feature;

  public showSidePanel = 'false';

  public deleteRelated = false;

  public formConfig: FormConfiguration;

  public relatedFeatures = [];

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CopyDialogData,
              private configService: FormconfigRepositoryService,
              private actionService: FormActionsService,
              private _snackBar: MatSnackBar,
              private featureInitializer: FeatureInitializerService,
              private formCopyService: FormCopyService) {
  }

  public ngOnInit(): void {
    let fieldsToCopy = new Map<string, string>();
    this.originalFeature = this.data.originalFeature;
    if (this.formCopyService.parentFeature != null) {
      if (this.formCopyService.parentFeature.objecttype === this.data.originalFeature.objecttype) {
        fieldsToCopy = this.formCopyService.featuresToCopy.get(this.formCopyService.parentFeature.objectGuid);
      }
    }
    this.formCopyService.parentFeature = this.data.originalFeature;
    this.formConfig = this.configService.getFormConfig(this.originalFeature.clazz);
    this.formCopyService.featuresToCopy.set(this.originalFeature['objectGuid'], fieldsToCopy);
    if (this.originalFeature.children) {
      for (const child of this.originalFeature.children) {
        const config = this.configService.getFormConfig(child.clazz);
        if (config) {
          // tslint:disable-next-line:no-shadowed-variable
          let fieldsToCopy = new Map<string, string>();
          this.formCopyService.featuresToCopy.forEach((oldfieldsToCopy, key) => {
            if (oldfieldsToCopy.get('objecttype') === child.objecttype) {
                fieldsToCopy = oldfieldsToCopy;
            }
          });
          fieldsToCopy.set('objecttype', child.objecttype);
          this.formCopyService.featuresToCopy.set(child.objectGuid, fieldsToCopy);
        }
      }
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

  public copy() {
    let successCopied = 0;
    const destinationFeatures = this.data.destinationFeatures;
    if (destinationFeatures.length > 0) {
      if (this.deleteRelated) {
        this.deleteRelatedFeatures();
      }
      const valuesToCopy = this.getPropertiesToMerge();
      const childsToCopy = this.getNewChildFeatures();
      for (let i  = 0; i <= destinationFeatures.length - 1; i++) {
        destinationFeatures[i] = {...destinationFeatures[i], ...valuesToCopy};
        for (let n = 0; n <= childsToCopy.length - 1; n++) {
          this.actionService.save$(false, childsToCopy[n], destinationFeatures[i]).subscribe(childSaved => {
            console.log('child saved');
          })
        }
        this.actionService.save$(false, destinationFeatures[i], destinationFeatures[i]).subscribe(savedFeature => {
            successCopied++;
            if (successCopied === destinationFeatures.length) {
              this._snackBar.open('Er zijn ' + successCopied + ' features gekopieerd', '', {
                duration: 5000,
              });
              this.dialogRef.close();
            }
          },
          error => {
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

  public deleteRelatedFeatures() {
    for (let i  = 0; i <= this.data.destinationFeatures.length - 1; i++) {
      const feature = this.data.destinationFeatures[i];
      const children = feature.children;
      for (let c  = 0; c <= children.length - 1; c++) {
        const child = children[c];
        this.actionService.removeFeature$(child, [feature]).subscribe(childRemoved => {
          console.log('child removed');
        });
      }
    }
  }

  public stringToNumber(key: string) {
    return Number(key);
  }

  public isFieldChecked(event: any) {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
    return fieldsToCopy.has(event);
  }

  public isEverythingChecked(tab: string): boolean {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
    for (let i  = 0; i <= this.formConfig.fields.length - 1; i++) {
      const config = this.formConfig.fields[i];
      if (config.tab.toString() === tab) {
        if (!fieldsToCopy.has(config.key)) {
            return false;
        }
      }
    }
    return true
  }

  public toggle(event: any, tab: string) {
    if (!event.checked) {
      const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
      for (let i  = 0; i <= this.formConfig.fields.length - 1; i++) {
        const config = this.formConfig.fields[i];
        if (config.tab.toString() === tab) {
          fieldsToCopy.delete(config.key);
        }
      }
    } else {
      const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
      for (let i  = 0; i <= this.formConfig.fields.length - 1; i++) {
        const config = this.formConfig.fields[i];
        if (config.tab.toString() === tab) {
          fieldsToCopy.set(config.key, config.label);
        }
      }
    }
  }

  public updateFieldToCopy(event: any) {
    if (!event.checked) {
      if (this.formCopyService.featuresToCopy.has(this.originalFeature['objectGuid'])) {
        const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
        if (fieldsToCopy.has(event.source.id)) {
          fieldsToCopy.delete(event.source.id);
        }
      }
    } else {
      if (this.formCopyService.featuresToCopy.has(this.originalFeature['objectGuid'])) {
        const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.originalFeature['objectGuid']);
        fieldsToCopy.set(event.source.id, event.source.name);
      }
    }
  }

  private getPropertiesToMerge(): any {
    const valuesToCopy = {};
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.formCopyService.parentFeature['objectGuid']);
    fieldsToCopy.forEach((value, key) => {
      valuesToCopy[key] = this.originalFeature[key];
    })
    return valuesToCopy;
  }

  private getNewChildFeatures(): Feature[] {
    const newChilds = [];
    const relatedFeatures = this.relatedFeatures;
    const parentFeature = this.formCopyService.parentFeature;
    this.formCopyService.featuresToCopy.forEach((fieldsToCopy, key) => {
      let newChild = {};
      if (key !== this.formCopyService.parentFeature['objectGuid']) {
        const valuesToCopy = {};
        for (let i = 0; i <= parentFeature.children.length - 1; i++) {
          const child = parentFeature.children[i];
          if (child.objectGuid === key) {
            fieldsToCopy.forEach((value, key1) => {
              valuesToCopy[key1] = child[key1];
            })
          }
        }
        newChild = this.featureInitializer.create(fieldsToCopy.get('objecttype'), valuesToCopy);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < relatedFeatures.length; i++) {
          if (relatedFeatures[i] === key) {
            newChilds.push(newChild);
          }
        }
      }
    });
    return newChilds;
  }

  public openForm(feature) {
    if (feature) {
        this.originalFeature = feature;
        this.formConfig = this.configService.getFormConfig(this.originalFeature.clazz);
    }
  }

  public setDeleteRelated(event: any) {
    this.deleteRelated = !this.deleteRelated;
  }

  public setCopyAllRelatedFeatures(event: any) {
    if (this.formCopyService.parentFeature.children) {
       this.relatedFeatures = [];
      // tslint:disable-next-line:prefer-for-of
       for (let i = 0; i < this.formCopyService.parentFeature.children.length; i++) {
         this.relatedFeatures.push(this.formCopyService.parentFeature.children[i].objectGuid);
       }
    }
  }

  public isAllRelatedFeaturesSet(): boolean {
    if (this.formCopyService.parentFeature.children) {
      return this.formCopyService.parentFeature.children.length === this.relatedFeatures.length;
    } else {
      return false;
    }
  }

  public settings() {
    if (this.width === '400px') {
      this.width = '800px';
      this.dialogRef.updateSize(this.width);
      this.showSidePanel = 'true';
    } else {
      this.width = '400px';
      this.dialogRef.updateSize(this.width);
      this.showSidePanel = 'false';
    }
  }
}
