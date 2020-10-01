import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import {
  Feature,
} from '../../shared/generated';

import {
  Attribute,
  ColumnizedFields,
  FormConfiguration,
  FormFieldType,
  IndexedFeatureAttributes,
  TabbedFields,
} from '../form/form-models';
import { FormCreatorHelpers } from './form-creator-helpers';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from '../form-field/form-field-helpers';

@Component({
  selector: 'tailormap-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.css'],
})
export class FormCreatorComponent implements OnChanges, OnDestroy, AfterViewInit {

  constructor(
    private actions: FormActionsService,
    private registry: LinkedAttributeRegistryService,
    private _snackBar: MatSnackBar) {
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
  @Input()
  public lookup: Map<string, string>;
  @Output()
  public formChanged = new EventEmitter<any>();

  public tabbedConfig: TabbedFields;

  public formgroep = new FormGroup({});

  private subscriptions = new Subscription();

  private domainValues = new Map<Attribute, any>();

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
    if (this.feature) {
      this.indexedAttributes = FormCreatorHelpers.convertFeatureToIndexed(this.feature, this.formConfig);
      this.createFormControls();
      this.registry.resetLinkedAttributes();
      this.formgroep.valueChanges.subscribe(s => {
        this.formChanged.emit({changed: true});
      });
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private prepareFormConfig(): TabbedFields {
    const tabbedFields: TabbedFields = {tabs: new Map<number, ColumnizedFields>()};
    const attrs = this.formConfig.fields;
    for (let tabNr = 1; tabNr <= this.formConfig.tabs; tabNr++) {
      const fields: Attribute[] = [];
      attrs.forEach(attr => {
        if (attr.tab === tabNr) {
          fields.push(attr);
        }
      });
      tabbedFields.tabs.set(tabNr, this.getColumizedFields(fields));
    }
    return tabbedFields;
  }

  private getColumizedFields(attrs: Attribute[]): ColumnizedFields {
    const columnizedFields: ColumnizedFields = {columns: new Map<number, Attribute[]>()};
    if (attrs.length === 0) {
      return columnizedFields;
    }
    const numCols = attrs.reduce((max, b) => Math.max(max, b.column), attrs[0].column);
    for (let col = 1; col <= numCols; col++) {
      const fields: Attribute[] = [];
      attrs.forEach(attr => {
        if (attr.column === col) {
          fields.push(attr);
        }
      });
      columnizedFields.columns.set(col, fields);
    }
    return columnizedFields;
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

  public save() {
    const feature = this.formgroep.value;
    feature.__fid = this.feature.objectGuid;
    this.mergeFromToFeature(feature);
    this.actions.save$(this.isBulk, this.feature, this.features[0]).subscribe(savedFeature => {
        const fs = this.updateFeatureInArray(savedFeature, this.features);
        this.features = [...fs];
        this.feature = {...savedFeature};
        this._snackBar.open('Opgeslagen', '', {duration: 5000});
        this.formChanged.emit({changed: false, feature: savedFeature, features: this.features});
      },
      error => {
        this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
          duration: 5000,
        });
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

  private mergeFromToFeature(form) {
    Object.keys(this.feature).forEach(attr => {
      for (const key in form) {
        if (form.hasOwnProperty(key) && key === attr) {
          this.feature[attr] = form[key];
          break;
        }
      }
    });
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
