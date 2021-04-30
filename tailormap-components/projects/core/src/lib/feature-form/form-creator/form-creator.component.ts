import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, Subscription } from 'rxjs';
import { Feature } from '../../shared/generated';
import { Attribute, FormConfiguration, FormFieldType, IndexedFeatureAttributes, TabbedField } from '../form/form-models';
import { FormCreatorHelpers } from './form-creator-helpers';
import { FormActionsService } from '../form-actions/form-actions.service';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { selectFormEditing } from '../state/form.selectors';
import { selectLayerIdForEditingFeatures } from '../../application/state/application.selectors';
import { editFeaturesComplete } from '../../application/state/application.actions';

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

  @Input()
  public formTabs: TabbedField[] = [];

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
      let value = !this.isBulk && featureAttribute ? featureAttribute.value : null;

      if (attr.type === FormFieldType.DOMAIN) {
        this.registry.registerDomainField(attr.linkedList, featureAttribute);
        if (!this.isBulk && featureAttribute.value && featureAttribute.value !== '-1') {
          this.domainValues.set(attr, featureAttribute.value);
          const compVal = FormFieldHelpers.getComparableValue(featureAttribute);
          value =  typeof compVal !== 'undefined' && compVal !== null ? compVal.val : featureAttribute.value;
        }
      }
      formControls[attr.key] = new FormControl(value, [FormFieldHelpers.nonExistingValueValidator(featureAttribute)]);

    }
    this.formgroep = new FormGroup(formControls);
    this.formgroep.markAllAsTouched();
    this.formgroep.valueChanges.subscribe(() => {
      this.formChanged.emit(true);
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.domainValues.forEach((value, attribute) => {
        this.registry.domainFieldChanged(attribute, value);
      });
    });
  }

  public resetForm(): void {
    this.store$.dispatch(FormActions.setFormEditing({editing: false}));
    this.formChanged.emit(false);
    this.createFormControls();
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
    const feature = this.formgroep.value;
    feature.__fid = this.feature.objectGuid;
    this.mergeFormToFeature(feature);
    const parentFeature = this.features[0];

    this.actions.save$(this.isBulk, this.isBulk ? this.features : [this.feature], parentFeature).subscribe(savedFeature => {
        this.store$.dispatch(FormActions.setNewFeature({newFeature: savedFeature, parentId: parentFeature.objectGuid}));
        this._snackBar.open('Opgeslagen', '', {duration: 5000});
      },
      error => {
        this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
          duration: 5000,
        });
      },
      () => {
        this.store$.select(selectLayerIdForEditingFeatures)
          .pipe(take(1), filter(layerId => layerId !== null))
          .subscribe(layerId => this.store$.dispatch(editFeaturesComplete({ layerId })));
      });
  }

  private mergeFormToFeature(form) {
    if (this.isBulk) {
      for (const key in form) {
        if (this.formgroep.controls[key]?.dirty) {
          this.features = this.features.map(feature => ({
            ...feature,
            [key]: form[key],
          }));
        }
      }
    } else {
      Object.keys(this.feature).forEach(attr => {
        for (const key in form) {
          if (form.hasOwnProperty(key) && key === attr) {
            this.feature = { ...this.feature, [attr]: form[key] };
            break;
          }
        }
      });
    }
  }

  public getChangedValues(): Feature[] {
    let features = [];
    if (this.formgroep.dirty) {
      const attributes = [];
      for (const key in this.formgroep.controls) {
        if (this.formgroep.controls.hasOwnProperty(key)) {
          const control = this.formgroep.controls[key];
          if (control.dirty) {
            attributes[key] = control.value;
          }
        }
      }
      features = [...this.features];
      features.forEach(f => f.attributes = attributes);
    }
    return features;
  }

}
