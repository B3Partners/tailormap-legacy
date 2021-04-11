import { Component, OnDestroy, OnInit } from '@angular/core';
import { Feature } from '../../shared/generated';
import { FormConfiguration } from '../form/form-models';
import { FormActionsService } from '../form-actions/form-actions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { FormCopyService } from './form-copy.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import {
  selectCopyDestinationFeatures,
  selectCurrentSelectedCopyFeature, selectParentCopyFeature,
} from '../state/form.selectors';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import {  selectFormConfigs } from '../../application/state/application.selectors';
import { closeCopyForm } from '../state/form.actions';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { TreeService } from '../../shared/tree/tree.service';

@Component({
  providers: [TreeService],
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();

  public currentFeature: Feature;

  public parentFeature: Feature;

  public allFormConfigs2: Map<string, ExtendedFormConfigurationModel>;

  public deleteRelated = false;

  public currentFormConfig: FormConfiguration;

  public relatedFeatures = [];

  public destinationFeatures: Feature[] = [];

  constructor(private actionService: FormActionsService,
              private _snackBar: MatSnackBar,
              private featureInitializer: FeatureInitializerService,
              private formCopyService: FormCopyService,
              private store$: Store<FormState>,
              private confirmDialogService: ConfirmDialogService) {
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngOnInit(): void {
    this.store$.select(selectCurrentSelectedCopyFeature)
      .pipe(
        takeUntil(this.destroyed),
        filter(feature => !!feature))
          .subscribe(feature => {
            this.currentFeature = feature;
            if(this.allFormConfigs2) {
              this.currentFormConfig = this.allFormConfigs2.get(feature.clazz);
            }
      });

    this.store$.select(selectCopyDestinationFeatures).pipe(takeUntil(this.destroyed)).subscribe(
      features => {
        this.destinationFeatures = features;
      },
    );

    combineLatest([
      this.store$.select(selectParentCopyFeature),
      this.store$.select(selectFormConfigs),
    ]).pipe(take(1)).subscribe(([parentFeature, allFormConfigs]) => {
      this.parentFeature = parentFeature;
      this.currentFormConfig = allFormConfigs.get(parentFeature.clazz);
      this.allFormConfigs2 = allFormConfigs;
      this.initAttributesToCopy(parentFeature, allFormConfigs);
    });
  }

  private initAttributesToCopy(parentFeature: Feature, allFormConfigs: Map<string, ExtendedFormConfigurationModel>) {
    let fieldsToCopy = new Map<string, string>();
    if (this.formCopyService.parentFeature != null && this.formCopyService.parentFeature.objecttype === parentFeature.objecttype) {
      // Er is al een parentFeature is (dit is er op het moment dat er al een keer eerder is gekopieerd)
      // De nieuw geselecteerde feature is van hetzelfde type, dus zet vorige geselecteerde velden terug
      fieldsToCopy = this.formCopyService.featuresToCopy.get(this.formCopyService.parentFeature.objectGuid);
    }
    this.formCopyService.parentFeature = parentFeature;
    this.formCopyService.featuresToCopy.set(parentFeature.objectGuid, fieldsToCopy);
    if (parentFeature.children) {
      for (const child of parentFeature.children) {
        const config = allFormConfigs.get(child.clazz);
        if (config) {
          let childFieldsToCopy = new Map<string, string>();
          // zet velden terug die hiervoor geselecteerd waren.
          this.formCopyService.featuresToCopy.forEach((oldfieldsToCopy) => {
            if (oldfieldsToCopy.get('objecttype') === child.objecttype) {
              childFieldsToCopy = oldfieldsToCopy;
            }
          });
          childFieldsToCopy.set('objecttype', child.objecttype);
          this.formCopyService.featuresToCopy.set(child.objectGuid, childFieldsToCopy);
        }
      }
    }
  }

  public cancel() {
    this.store$.dispatch(closeCopyForm());
  }

  public beforeCopy(): void {
    this.confirmDialogService.confirm$('Opslaan', 'Weet je het zeker?', true)
      .pipe(takeUntil(this.destroyed)).subscribe(
      (result) => {
        if (result) {
          this.copy();
        }
      });
  }

  public copy() {
    let successCopied = 0;
    const destinationFeatures = this.destinationFeatures;
    if (destinationFeatures.length > 0) {
      if (this.deleteRelated) {
        this.deleteRelatedFeatures();
      }
      const valuesToCopy = this.getPropertiesToMerge();
      const childsToCopy = this.getNewChildFeatures();
      for (let i  = 0; i <= destinationFeatures.length - 1; i++) {
        const copydest = {...destinationFeatures[i], ...valuesToCopy};
        for (let n = 0; n <= childsToCopy.length - 1; n++) {
          this.actionService.save$(false, [childsToCopy[n]], copydest).subscribe(() => {
            console.log('child saved');
          });
        }
        this.actionService.save$(false, [copydest], copydest).subscribe(() => {
            successCopied++;
            if (successCopied === destinationFeatures.length) {
              this._snackBar.open('Er zijn ' + successCopied + ' features gekopieerd', '', {
                duration: 5000,
              });
              this.cancel();
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
    for (let i  = 0; i <= this.destinationFeatures.length - 1; i++) {
      const feature = this.destinationFeatures[i];
      const children = feature.children;
      for (let c  = 0; c <= children.length - 1; c++) {
        const child = children[c];
        this.actionService.removeFeature$(child).subscribe(() => {
          console.log('child removed');
        });
      }
    }
  }

  public stringToNumber(key: string) {
    return Number(key);
  }

  public isFieldChecked(event: any) {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
    return fieldsToCopy.has(event);
  }

  public isEverythingChecked(tab: number): boolean {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
    for (let i  = 0; i <= this.currentFormConfig.fields.length - 1; i++) {
      const config = this.currentFormConfig.fields[i];
      if (config.tab.toString() === tab.toString()) {
        if (!fieldsToCopy.has(config.key)) {
            return false;
        }
      }
    }
    return true;
  }

  // zet alles aan of uit voor de geselecteerde tab
  public toggle(event: any, tab: number) {
    if (!event.checked) {
      const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
      for (let i  = 0; i <= this.currentFormConfig.fields.length - 1; i++) {
        const config = this.currentFormConfig.fields[i];
        if (config.tab.toString() === tab.toString()) {
          fieldsToCopy.delete(config.key);
        }
      }
    } else {
      const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
      for (let i  = 0; i <= this.currentFormConfig.fields.length - 1; i++) {
        const config = this.currentFormConfig.fields[i];
        if (config.tab.toString() === tab.toString()) {
          fieldsToCopy.set(config.key, config.label);
        }
      }
    }
  }

  public updateFieldToCopy(event: any) {
    if (!event.checked) {
      if (this.formCopyService.featuresToCopy.has(this.currentFeature.objectGuid)) {
        const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
        if (fieldsToCopy.has(event.source.id)) {
          fieldsToCopy.delete(event.source.id);
        }
      }
    } else {
      if (this.formCopyService.featuresToCopy.has(this.currentFeature.objectGuid)) {
        const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentFeature.objectGuid);
        fieldsToCopy.set(event.source.id, event.source.name);
        this.formCopyService.featuresToCopy.set(this.currentFeature.objectGuid, fieldsToCopy);
      }
    }
  }

  // alleen de properties voor main feature
  private getPropertiesToMerge(): any {
    const valuesToCopy = {};
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.formCopyService.parentFeature.objectGuid);
    fieldsToCopy.forEach((value, key) => {
      valuesToCopy[key] = this.currentFeature[key];
    });
    return valuesToCopy;
  }

  private getNewChildFeatures(): Feature[] {
    const newChilds = [];
    const relatedFeatures = this.relatedFeatures;
    const parentFeature = this.formCopyService.parentFeature;
    this.formCopyService.featuresToCopy.forEach((fieldsToCopy, key) => {
      if (fieldsToCopy.get('objecttype')) {
        let newChild = {};
        if (key !== this.formCopyService.parentFeature.objectGuid) {
          const valuesToCopy = {};
          for (let i = 0; i <= parentFeature.children.length - 1; i++) {
            const child = parentFeature.children[i];
            if (child.objectGuid === key) {
              fieldsToCopy.forEach((value, key1) => {
                valuesToCopy[key1] = child[key1];
              });
            }
          }
          newChild = this.featureInitializer.create(fieldsToCopy.get('objecttype'), valuesToCopy);
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < relatedFeatures.length; i++) {
            if (relatedFeatures[i] === key) {
              newChilds.push(newChild);
            }
          }
        }
      }
    });
    return newChilds;
  }

  public setDeleteRelated() {
    this.deleteRelated = !this.deleteRelated;
  }

  public setCopyAllRelatedFeatures() {
    if (this.formCopyService.parentFeature.children) {
      this.relatedFeatures = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
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

  public relatedFeaturesCheckedChanged(relFeatures: Map<string, boolean>) {
    relFeatures.forEach((checked, id) => {
      if (checked) {
        if (!this.relatedFeatures.includes(id) && id !== this.parentFeature.objectGuid) {
          this.relatedFeatures.push(id);
        }
      } else {
        for (let i = 0; i < this.relatedFeatures.length; i++) {
          if (id === this.relatedFeatures[i]) {
            this.relatedFeatures.splice(i, 1);
          }
        }
      }
    });
  }

  public isSelectedTab(tab: number, key: number) {
    return `${tab}` === `${key}`;
  }

}
