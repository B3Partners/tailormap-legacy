import { Component, OnInit, Input, Injectable, OnChanges } from '@angular/core';
import { FormConfiguration, TabbedFields, Feature, ColumnizedFields, Attribute, IndexedFeatureAttributes } from '../../shared/wegvakken-models';
import { FlatNode } from '../wegvakken-tree/wegvakken-tree-models';

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

  public tabbedConfig: TabbedFields;

  constructor() {
  }

  public ngOnChanges() {
    this.tabbedConfig = this.prepareFormConfig();
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

}
