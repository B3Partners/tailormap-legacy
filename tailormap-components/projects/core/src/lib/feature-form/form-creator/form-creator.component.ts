import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { Feature } from '../../shared/generated';
import { Attribute, FormConfiguration, FormFieldType, IndexedFeatureAttributes, TabbedFields } from '../form/form-models';
import { FormCreatorHelpers } from './form-creator-helpers';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from '../form-field/form-field-helpers';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { WorkflowState } from '../../workflow/state/workflow.state';
import { loadDataForTab } from '../../user-interface/attributelist/state/attribute-list.actions';
import { selectLayerIdForLayerName } from '../../application/state/application.selectors';

@Component({
  selector: 'tailormap-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.css'],
})
export class FormCreatorComponent implements OnChanges, OnDestroy, AfterViewInit {

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

  public tabbedConfig: TabbedFields;

  public editting = false;

  public formgroep = new FormGroup({});

  private subscriptions = new Subscription();

  private domainValues = new Map<Attribute, any>();

  private destroyed = new Subject();

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
    if (this.feature) {
      this.indexedAttributes = FormCreatorHelpers.convertFeatureToIndexed(this.feature, this.formConfig);
      this.createFormControls();
      this.registry.resetLinkedAttributes();
      this.formgroep.valueChanges.subscribe(s => {
        this.formChanged.emit(true);
      });
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  private prepareFormConfig(): TabbedFields {
    const tabbedFields: TabbedFields = {tabs: new Map<number, Attribute[]>()};
    const attrs = this.formConfig.fields;
    for (let tabNr = 1; tabNr <= this.formConfig.tabs; tabNr++) {
      tabbedFields.tabs.set(tabNr, attrs.filter(attr => attr.tab === tabNr));
    }
    return tabbedFields;
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
        if (featureAttribute.value && featureAttribute.value !== '-1') {
          this.domainValues.set(attr, featureAttribute.value);
          value = parseInt('' + value, 10);
        }
      }
      formControls[attr.key] = new FormControl(value, [FormFieldHelpers.nonExistingValueValidator(featureAttribute)]);

    }
    this.formgroep = new FormGroup(formControls);
    this.formgroep.markAllAsTouched();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.domainValues.forEach((value, attribute) => {
        this.registry.domainFieldChanged(attribute, value);
      });
    });
  }

  public resetForm() : void {
    this.editting = false;
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
        })
    } else {
      this.save();
    }
  }

  public save() {
    const feature = this.formgroep.value;
    feature.__fid = this.feature.objectGuid;
    const clazzName = this.feature.clazz;
    this.mergeFormToFeature(feature);

    this.actions.save$(this.isBulk, this.isBulk ? this.features : [this.feature], this.features[0]).subscribe(savedFeature => {
        const fs = this.updateFeatureInArray(savedFeature, this.features);
        this.store$.dispatch(FormActions.setSetFeatures({features: fs}));
        this._snackBar.open('Opgeslagen', '', {duration: 5000});
      },
      error => {
        this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
          duration: 5000,
        });
      },
      () => {
        this.store$.select(selectLayerIdForLayerName, clazzName)
          .pipe(take(1), filter(layerId => layerId !== null))
          .subscribe(layerId => this.store$.dispatch(loadDataForTab({ layerId })));
      });
  }

  public updateFeatureInArray(feature: Feature, features: Feature[]): Feature[] {
    let fs = [];
    if (!features) {
      return fs;
    }
    const parentIdx = features.findIndex(f =>
      (f.objectGuid === feature.objectGuid || f.objectGuid === FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT));
    if (parentIdx !== -1) {
      fs = [
        ...features.slice(0, parentIdx),
        {...feature},
        ...features.slice(parentIdx + 1),
      ];
    } else {
      features.forEach((feat) => {
        feat.children = this.updateFeatureInArray(feature, feat.children);
        fs.push(feat);
      });
    }
    return fs;
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
