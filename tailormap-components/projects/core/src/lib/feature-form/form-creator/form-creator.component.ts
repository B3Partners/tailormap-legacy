import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, Subscription } from 'rxjs';
import { Feature, Field } from '../../shared/generated';
import { Attribute, FormConfiguration, FormFieldType, IndexedFeatureAttributes, TabbedField } from '../form/form-models';
import { FormCreatorHelpers } from './form-creator-helpers';
import { FormActionsService } from '../form-actions/form-actions.service';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { ConfirmDialogService } from '@tailormap/shared';
import { concatMap, filter, take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { selectBulkEditDetails, selectFormEditing } from '../state/form.selectors';
import { selectLayerIdForEditingFeatures } from '../../application/state/application.selectors';
import { editFeaturesComplete } from '../../application/state/application.actions';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { FeatureUpdateHelper } from '../../shared/feature-initializer/feature-update.helper';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'tailormap-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.css'],
})
export class FormCreatorComponent implements OnChanges, OnDestroy, AfterViewInit, OnInit {

  constructor(
    private store$: Store<FormState | WorkflowState>,
    private actions: FormActionsService,
    private registry: LinkedAttributeRegistryService,
    private _snackBar: MatSnackBar,
    private featureInitializer: FeatureInitializerService,
    private confirmDialogService: ConfirmDialogService) {
  }

  @Input()
  public formConfig: FormConfiguration;

  @Input()
  public feature: Feature;

  @Input()
  public features: Feature[];

  @Input()
  public indexedAttributes: IndexedFeatureAttributes;

  @Input()
  public isBulk = false;

  @Output()
  public formChanged = new EventEmitter<boolean>();

  @Output()
  public formValidChanged = new EventEmitter<boolean>();

  @Input()
  public formTabs: TabbedField[] = [];

  @Input()
  public parentId: string | null = null;

  public trackByTabId = (idx, tab: TabbedField) => tab.tabId;

  public editing$: Observable<boolean>;

  public formgroep = new FormGroup({});

  private subscriptions = new Subscription();

  private domainValues = new Map<Attribute, any>();

  private destroyed = new Subject();

  public ngOnChanges() {
    if (this.feature) {
      this.indexedAttributes = FormCreatorHelpers.convertFeatureToIndexed(this.feature, this.formConfig);
      this.createFormControls();
      this.registry.resetLinkedAttributes();
    }
  }

  public ngOnInit(): void {
    this.editing$ = this.store$.select(selectFormEditing);
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  private createFormControls() {
    const attrs = this.formConfig.fields;
    const formControls = {};
    this.domainValues = new Map<Attribute, any>();
    for (const attr of attrs) {
      const featureAttribute = this.indexedAttributes.attrs.get(attr.key);
      let value: string | number | boolean = !this.isBulk && featureAttribute ? featureAttribute.value : null;
      if (attr.type === FormFieldType.DOMAIN) {
        this.registry.registerDomainField(attr.linkedList, featureAttribute);
        if (!this.isBulk && featureAttribute.value && featureAttribute.value !== '') {
          this.domainValues.set(attr, featureAttribute.value);
          const compVal = FormFieldHelpers.findSelectedOption(featureAttribute.options, featureAttribute.value);
          value = typeof compVal !== 'undefined' && compVal !== null ? compVal.val : featureAttribute.value;
        }
      }
      const control = new FormControl(value, [FormFieldHelpers.nonExistingValueValidator(featureAttribute)]);
      if (attr.isReadOnly) {
        control.disable({ emitEvent: false });
      }
      if (attr.mandatory) {
        control.setValidators([ Validators.required ]);
      }
      formControls[attr.key] = control;
    }
    this.formgroep = new FormGroup(formControls);
    this.formgroep.markAllAsTouched();
    this.formgroep.valueChanges.subscribe(() => {
      this.formChanged.emit(true);
      this.formValidChanged.emit(this.formgroep.valid);
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.domainValues.forEach((value, attribute) => {
        this.registry.domainFieldChanged(attribute, value);
      });
    });
  }

  public beforeSave() {
    // show confirm message when multi-edit
    if (this.isBulk) {
      this.confirmDialogService.confirm$('Opslaan', 'Weet je het zeker?', true)
        .pipe(takeUntil(this.destroyed)).subscribe(
        (result) => {
          if (result) {
            this.save();
          }
        });
    } else {
      this.save();
    }
  }

  public save() {
    const isNewFeature = this.feature.fid === FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT;
    this.store$.select(selectBulkEditDetails)
      .pipe(
        take(1),
        concatMap((bulkEditDetails: [ string, string ] | null) => {
          if (bulkEditDetails !== null) {
            // call bulk edit end-point
            const bulkEditFilter = bulkEditDetails[0];
            const bulkEditFeatureTypeName = bulkEditDetails[1];
            const updatedFields = this.getUpdatedFields();
            console.log('Bulk edit - filter: ', bulkEditFilter, ' - feature type - ', bulkEditFeatureTypeName, ' - updated fields - ', updatedFields);
            return this.actions.saveBulk$(bulkEditFilter, bulkEditFeatureTypeName, updatedFields);
          }
          this.mergeFormToFeature();
          if (this.isBulk) {
            return this.actions.saveSelection$(this.features);
          }
          return this.actions.save$(this.feature, this.parentId);
        }),
      )
      .subscribe({
        next: (savedFeature) => this.handleSaveSuccess(isNewFeature, savedFeature),
        error: error => this.showSaveError(error),
        complete: () => this.handleSaveComplete(),
      });
  }

  private handleSaveSuccess(isNewFeature: boolean, savedFeature: Feature | Feature[]) {
    this._snackBar.open('Opgeslagen', '', {duration: 5000});
    if (Array.isArray(savedFeature)) {
      // Is bulk edit so close the form
      this.store$.dispatch(FormActions.setCloseFeatureForm());
      return;
    }
    if (isNewFeature) {
      this.store$.dispatch(FormActions.setFeatureRemoved({ feature: this.feature, keepFormOpen: true }));
    }
    this.store$.dispatch(FormActions.setNewFeature({ newFeature: savedFeature, parentId: this.parentId }));
  }

  private showSaveError(error: HttpErrorResponse) {
    const errorMsg = error?.error?.message;
    this._snackBar.open(`Fout: Feature niet kunnen opslaan${errorMsg ? ': ' + errorMsg : ''}`, '', {
      duration: 5000,
    });
  }

  private handleSaveComplete() {
    this.store$.select(selectLayerIdForEditingFeatures)
      .pipe(take(1), filter(layerId => layerId !== null))
      .subscribe(layerId => this.store$.dispatch(editFeaturesComplete({ layerId })));
  }

  private mergeFormToFeature() {
    const updatedFields = this.getUpdatedFields();
    if (!this.isBulk) {
      this.feature = FeatureUpdateHelper.updateFeatureAttributes(this.feature, updatedFields);
    } else {
      this.features = this.features.map(feature => FeatureUpdateHelper.updateFeatureAttributes(feature, updatedFields));
    }
  }

  private getUpdatedFields() {
    const updatedFields: Record<string, any> = {};
    Object.keys(this.formgroep.controls).forEach(key => {
      const control = this.formgroep.get(key);
      if (!control || !control.dirty || control.value === 'null') {
        return;
      }
      updatedFields[key] = typeof control.value === 'undefined' ? '' : control.value;
    });
    return updatedFields;
  }

}
