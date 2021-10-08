import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, Subscription } from 'rxjs';
import { Feature } from '../../shared/generated';
import { Attribute, FormConfiguration, FormFieldType, IndexedFeatureAttributes, TabbedField } from '../form/form-models';
import { FormCreatorHelpers } from './form-creator-helpers';
import { FormActionsService } from '../form-actions/form-actions.service';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { ConfirmDialogService } from '@tailormap/shared';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { selectFormEditing } from '../state/form.selectors';
import { selectLayerIdForEditingFeatures } from '../../application/state/application.selectors';
import { editFeaturesComplete } from '../../application/state/application.actions';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

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
        if (!this.isBulk && featureAttribute.value && featureAttribute.value !== '-1') {
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
    const feature = this.formgroep.value;
    feature.__fid = this.feature.fid;
    this.mergeFormToFeature(feature);
    const isNewFeature = this.feature.fid === FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT;
    this.actions.save$(this.isBulk, this.isBulk ? this.features : [ this.feature ], this.parentId).subscribe(savedFeature => {
      if (isNewFeature) {
        this.store$.dispatch(FormActions.setFeatureRemoved({ feature: this.feature }));
      }
      this.store$.dispatch(FormActions.setNewFeature({ newFeature: savedFeature, parentId: this.parentId }));
      this._snackBar.open('Opgeslagen', '', {duration: 5000});
    },
    error => {
      const errorMsg = error?.error?.message;
      this._snackBar.open(`Fout: Feature niet kunnen opslaan${errorMsg ? ': ' + errorMsg : ''}`, '', {
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

          this.features = this.features.map(f=> this.featureInitializer.convertOldToNewFeature(f, this.formConfig));
          this.features = this.features.map(feature => {
            const index = feature.attributes.findIndex(field => field.key === key);
            const f= {
              ...feature,
              attributes:[
                ...feature.attributes.slice(0, index),
                {
                  key,
                  value : form[key],
                  type: feature.attributes[index].type,
                },
                ...feature.attributes.slice(index+1),
              ],
            };
            return f;

          });
        }
      }
    } else {
      this.feature.attributes.forEach((attr, index) => {
        for (const key in form) {
          if (form.hasOwnProperty(key) && key === attr.key &&  form[key] !== 'null') {
            this.feature.attributes = [
              ...this.feature.attributes.slice(0, index),
              {
                key,
                value : form[key],
                type: this.feature.attributes[index].type,
              },
              ...this.feature.attributes.slice(index+1),
            ];

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
