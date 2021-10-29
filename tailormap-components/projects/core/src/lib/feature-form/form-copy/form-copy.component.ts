import { Component, OnDestroy, OnInit } from '@angular/core';
import { Feature } from '../../shared/generated';
import { Attribute, FormConfiguration } from '../form/form-models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormCopyService } from './form-copy.service';
import { ConfirmDialogService, TreeService } from '@tailormap/shared';
import { concatMap, filter, take, takeUntil } from 'rxjs/operators';
import { forkJoin, of, Subject } from 'rxjs';
import { selectCopyDestinationFeatures, selectCurrentSelectedCopyFeatureAndFormConfig, selectParentCopyFeature } from '../state/form.selectors';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import { closeCopyForm } from '../state/form.actions';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

interface Tab {
  id: number;
  label: string;
  fields: Attribute[];
}

@Component({
  providers: [TreeService],
  selector: 'tailormap-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css'],
})
export class FormCopyComponent implements OnInit, OnDestroy {

  public baseCopyFeature: Feature;
  public tabs: Tab[] = [];
  public deleteRelated = false;
  public currentFormConfig: FormConfiguration;
  public destinationFeatures: Feature[] = [];
  public trackByTabId = (idx: number, tab: Tab) => tab.id;

  private destroyed = new Subject();
  private currentlySelectedFeatureFeatureType: string;
  public relatedFeatures: string[] = [];
  private allCheckedCache = new Map<string, boolean>();

  constructor(
    private _snackBar: MatSnackBar,
    private formCopyService: FormCopyService,
    private store$: Store<FormState>,
    private confirmDialogService: ConfirmDialogService,
  ) {
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngOnInit(): void {
    this.store$.select(selectCurrentSelectedCopyFeatureAndFormConfig)
      .pipe(
        takeUntil(this.destroyed),
        filter(featureAndConfig => !!featureAndConfig),
      )
      .subscribe(featureAndConfig => {
        this.currentlySelectedFeatureFeatureType = featureAndConfig.feature.tableName;
        this.tabs = this.createTabs(featureAndConfig.formConfig);
        this.currentFormConfig = featureAndConfig.formConfig;
      });

    this.store$.select(selectCopyDestinationFeatures)
      .pipe(takeUntil(this.destroyed))
      .subscribe(features => this.destinationFeatures = features);

    this.store$.select(selectParentCopyFeature)
      .pipe(takeUntil(this.destroyed))
      .subscribe(parentFeature => this.baseCopyFeature = parentFeature);
  }

  public cancel() {
    this.store$.dispatch(closeCopyForm());
  }

  public beforeCopy(): void {
    this.confirmDialogService.confirm$('Opslaan', 'Weet je het zeker?')
      .pipe(
        take(1),
        filter(result => !!result),
        concatMap(() => {
          const copyRequests$ = this.formCopyService.copy(
            this.baseCopyFeature,
            this.destinationFeatures,
            this.deleteRelated,
            this.relatedFeatures,
          );
          return forkJoin([
            forkJoin(copyRequests$),
            of(copyRequests$.length),
          ]);
        }),
      )
      .subscribe(
        ([ results, totalResults ]) => {
          if (results.filter(result => result.success).length === totalResults) {
            this._snackBar.open(`Er zijn ${this.destinationFeatures.length} features gekopieerd`, '', {duration: 5000});
          } else {
            this._snackBar.open(`Er zijn fouten opgetreden tijdens het kopieren van de objecten. Controleer het resultaat en kopieer zo nodig opnieuw`, '', {duration: 5000});
          }
          this.cancel();
        },
        (_error) => this._snackBar.open('Fout: Objecten niet kunnen kopieren', '', { duration: 5000 }),
      );
  }

  public isFieldChecked(fieldKey: string) {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentlySelectedFeatureFeatureType);
    return fieldsToCopy && fieldsToCopy.has(fieldKey);
  }

  public isEverythingChecked(tabId: number): boolean {
    const key = `${this.currentlySelectedFeatureFeatureType}_${tabId}`;
    if (!this.allCheckedCache.has(key)) {
      this.updateAllCheckedCache(tabId, this.isAllChecked(tabId));
    }
    return this.allCheckedCache.get(key);
  }

  private updateAllCheckedCache(tabId: number, checked: boolean) {
    const key = `${this.currentlySelectedFeatureFeatureType}_${tabId}`;
    this.allCheckedCache.set(key, checked);
  }

  private isAllChecked(tabId: number) {
    const fieldsToCopy = this.formCopyService.featuresToCopy.get(this.currentlySelectedFeatureFeatureType);
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !fieldsToCopy) {
      return false;
    }
    return tab.fields.findIndex(f => !fieldsToCopy.has(f.key)) === -1;
  }

  public toggleAll(event: MatCheckboxChange, tabId: number) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) {
      return;
    }
    tab.fields.forEach(field => {
      if (event.checked) {
        this.formCopyService.enableField(this.currentlySelectedFeatureFeatureType, field.key);
      } else {
        this.formCopyService.disableField(this.currentlySelectedFeatureFeatureType, field.key);
      }
    });
    this.updateAllCheckedCache(tabId, event.checked);
  }

  public updateFieldToCopy(event: MatCheckboxChange, tabId: number, fieldKey: string) {
    if (event.checked) {
      this.formCopyService.enableField(this.currentlySelectedFeatureFeatureType, fieldKey);
    } else {
      this.formCopyService.disableField(this.currentlySelectedFeatureFeatureType, fieldKey);
    }
    this.updateAllCheckedCache(tabId, this.isAllChecked(tabId));
  }

  public setDeleteRelated($event: MatCheckboxChange) {
    this.deleteRelated = $event.checked;
  }

  public setCopyAllRelatedFeatures() {
    if (this.isAllRelatedFeaturesSet()) {
      this.relatedFeatures = [];
      return;
    }
    this.relatedFeatures = (this.baseCopyFeature.children || []).map(child => child.fid);
  }

  public isAllRelatedFeaturesSet(): boolean {
    return this.baseCopyFeature.children
      ? this.baseCopyFeature.children.length === this.relatedFeatures.length
      : false;
  }

  public relatedFeaturesCheckedChanged(relFeatures: Map<string, boolean>) {
    const relatedFeatures = [ ...this.relatedFeatures ];
    relFeatures.forEach((checked, id) => {
      if (checked) {
        if (!relatedFeatures.includes(id) && id !== this.baseCopyFeature.fid) {
          relatedFeatures.push(id);
        }
      } else {
        const idx = relatedFeatures.findIndex(rf => rf === id);
        if (idx !== -1) {
          relatedFeatures.splice(idx, 1);
        }
      }
    });
    this.relatedFeatures = relatedFeatures;
  }

  private createTabs(formConfig: ExtendedFormConfigurationModel): Tab[] {
    if (!formConfig) {
      return [];
    }
    const tabbedFields: Tab[] = [];
    for (let tabNr = 1; tabNr <= formConfig.tabs; tabNr++) {
      tabbedFields.push({
        id: tabNr,
        label: formConfig.tabConfig[tabNr],
        fields: formConfig.fields.filter(attr => attr.tab === tabNr),
      });
    }
    return tabbedFields;
  }

}
