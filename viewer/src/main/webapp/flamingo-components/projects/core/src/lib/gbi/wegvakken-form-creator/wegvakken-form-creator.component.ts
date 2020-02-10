import { Component, OnInit, Input, Injectable, OnChanges } from '@angular/core';
import { FormConfiguration, TabbedFields, Feature, ColumnizedFields, Attribute,
  IndexedFeatureAttributes } from '../../shared/wegvakken-models';
import { WegvakkenFormSaveService } from '../wegvakken-form-save.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'flamingo-wegvakken-form-creator',
  templateUrl: './wegvakken-form-creator.component.html',
  styleUrls: ['./wegvakken-form-creator.component.css'],
})
export class WegvakkenFormCreatorComponent implements OnChanges {

  @Input()
  public formConfig: FormConfiguration;
  @Input()
  public feature: Feature;
  @Input()
  public indexedAttributes: IndexedFeatureAttributes;
  @Input()
  public applicationId: string;

  public tabbedConfig: TabbedFields;

  public formgroep = new FormGroup({});

  constructor(private saveService: WegvakkenFormSaveService) {
  }

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
    this.createFormControls();
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
    const lookup = {};
    this.feature.attributes.forEach(a => {
      lookup [a.key] = a;
    });
    const attrs = this.formConfig.fields;
    const formControls = {};
    for ( const attr of attrs) {
      formControls[attr.key] = new FormControl(lookup[attr.key] ? lookup[attr.key].value : '');
    }
    this.formgroep = new FormGroup(formControls);
  }

  public save() {
    console.log('asdfsdf', this.formgroep.value);
    const feature = this.formgroep.value;
    feature.__fid = this.feature.id;
    this.saveService.save( this.feature, feature, this.feature.appLayer, this.applicationId).subscribe(
      (d) => {
        const a = 0;
      }, // success path
      error => {
        const b = 0;
      }, // error path
    );
  }

}
