import { Component,  Input, OnChanges, OnDestroy, Output, EventEmitter} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import {
  Feature,
  FeatureControllerService,
  Wegvakonderdeel,
  WegvakonderdeelControllerService
} from "../../shared/generated";

import {
  Attribute,
  ColumnizedFields,
  FormConfiguration,
  IndexedFeatureAttributes,
  TabbedFields
} from "../form/form-models";
import { FormCreatorHelpers } from './form-creator-helpers';
import {FormActionsService} from "../form-actions/form-actions.service";

@Component({
  selector: 'flamingo-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.css'],
})
export class FormCreatorComponent implements OnChanges, OnDestroy {

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
  public formChanged = new EventEmitter<boolean>();

  public tabbedConfig: TabbedFields;

  public formgroep = new FormGroup({});

  private subscriptions = new Subscription();

  constructor(
    private service: FeatureControllerService,
    private actions: FormActionsService,
    private _snackBar: MatSnackBar) {
  }

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
    this.indexedAttributes = FormCreatorHelpers.convertFeatureToIndexed(this.feature, this.formConfig);
    this.createFormControls();
    this.formgroep.valueChanges.subscribe(s=>{this.formChanged.emit(true);});
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private prepareFormConfig(): TabbedFields {
    const tabbedFields: TabbedFields = {tabs: new Map<number, ColumnizedFields>()};
    const attrs = this.formConfig.fields;
    for (let tabNr = 1 ; tabNr <= this.formConfig.tabs ; tabNr++) {
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
    for (let col = 1 ; col <= numCols ; col++) {
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
    for ( const attr of attrs) {
      formControls[attr.key] = new FormControl(!this.isBulk && this.indexedAttributes.attrs.get(attr.key)
        ? this.indexedAttributes.attrs.get(attr.key).value : null);
    }
    this.formgroep = new FormGroup(formControls);
  }

  public save() {
    const feature = this.formgroep.value;
    feature.__fid = this.feature.id;
    this.mergeFromToFeature(feature);
    this.actions.save(this.isBulk, this.feature).subscribe(feature=>{
        this.feature = {...feature};
        this.features = this.updateFeatureInArray(feature, this.features);
        this._snackBar.open('Opgeslagen', '', {duration: 5000});
        this.formChanged.emit(false);
      },
      error => {
        this._snackBar.open('Fout: Feature niet kunnen opslaan: ' + error.error.message, '', {
          duration: 5000,
        });
      });
  }

  private updateFeatureInArray(feature : Feature, features: Feature[]): Feature[]{
    let fs = [];
    if(!features){
      return fs;
    }
    const parentIdx = features.findIndex(f => f.id === feature.id);
    if(parentIdx !== -1){
      fs = [
        ...features.slice(0, parentIdx),
        {...feature},
        ...features.slice(parentIdx + 1)
      ]
    }else{
      fs = features.map(f => f.children = this.updateFeatureInArray(feature, f.children));
    }
    return fs;
  }

  private mergeFromToFeature(form){
    Object.keys(this.feature).forEach(attr=>{
      for(const key in form){
        if(form.hasOwnProperty(key) && key === attr){
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
      for ( const key in this.formgroep.controls) {
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
