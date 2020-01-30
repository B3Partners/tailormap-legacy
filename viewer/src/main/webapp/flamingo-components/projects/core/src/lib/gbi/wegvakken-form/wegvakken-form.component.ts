import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormConfigurations, DialogData, Attribute, FormConfiguration, TabbedFields, ColumnizedFields } from '../../shared/wegvakken-models';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnInit {

  public formConfig: FormConfiguration;
  public tabbedConfig: TabbedFields;

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData ) {
      this.formConfig = data.formConfigs.config[data.formFeature.featureType];
      this.tabbedConfig = this.prepareFormConfig();
  }

  public ngOnInit() { 
  }

  private prepareFormConfig () : TabbedFields{
    let tabbedFields:  TabbedFields = {tabs: new Map<number, ColumnizedFields>()};
    let attrs = this.formConfig.fields;
    for(let tabNr = 1 ; tabNr <= this.formConfig.tabs ; tabNr++){
      const fields : Attribute[] = [];
      attrs.forEach(attr=>{
        if(attr.tab === tabNr){
          fields.push(attr);
        }
      })
      tabbedFields.tabs.set(tabNr, this.getColumizedFields(fields));
    }
    return tabbedFields;
  }

  private getColumizedFields (attrs: Attribute[]) : ColumnizedFields{
    let numCols = attrs.reduce((max, b) => Math.max(max,b.column), attrs[0].column);
    let columnizedFields : ColumnizedFields = {columns: new Map<number, Attribute[]>()};
    for(let col = 1 ; col <= numCols ; col++){
      const fields : Attribute[] = [];
      attrs.forEach(attr=>{
        if(attr.column === col){
          fields.push(attr);
        }
      })
      columnizedFields.columns.set(col, fields);
    }
    return columnizedFields;
  }

  public closeDialog() {
    this.dialogRef.close();
  }
}
