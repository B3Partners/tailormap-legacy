import { Component, Inject, OnDestroy, Input } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { filter, take } from 'rxjs/operators';
import { WegvakkenFormSaveService } from '../wegvakken-form-save.service';
import { Subscription } from 'rxjs';
import {DialogData} from "../wegvak-popup/wegvak-popup-models";
import {
  FeatureAttribute,
  FormConfiguration,
  FormConfigurations,
  IndexedFeatureAttributes
} from "./wegvakken-form-models";
import {Feature} from "../../shared/generated";

@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnDestroy {

  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;
  public formConfigs: FormConfigurations;
  public indexedAttributes: IndexedFeatureAttributes;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public lookup: Map<string, string>;
  public formDirty: boolean;

  private subscriptions = new Subscription();
  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private confirmDialogService: ConfirmDialogService ,
               private saveService: WegvakkenFormSaveService,
               private _snackBar: MatSnackBar) {
      this.formConfigs = data.formConfigs;
      this.features = data.formFeatures;
      this.feature = this.features[0];
      this.isBulk = !!data.isBulk;
      this.lookup = data.lookup;

      for (const key in this.formConfigs.config) {
        if (this.formConfigs.config.hasOwnProperty(key)) {
          const cf: FormConfiguration = this.formConfigs.config[key];
          if (cf.newPossible) {
            this.formsForNew.push(cf);
          }
        }
      }

      this.initForm();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initForm() {
    this.formDirty = false;
    this.formConfig = this.formConfigs.config[this.feature.clazz];
    this.indexedAttributes = this.convertFeatureToIndexed(this.feature);
  }

  public openForm(feature) {
    if (feature && !this.isBulk) {
      if(this.formDirty){
        this.closeNotification(function(){
          this.feature = feature;
          this.initForm();
        });
      }else{
        this.feature = feature;
        this.initForm();
      }
    }
  }

  public formChanged(changed: boolean){
    this.formDirty = changed;
    if(!changed){
      this.features = [...this.features];
    }
  }

  private convertFeatureToIndexed(feat: Feature): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const field of this.formConfig.fields) {
      m.set(field.key, {...field, value: feat[field.key]});
    }
    return {attrs: m};
  }

  public remove() {
    /*const attribute = this.feature.attributes.find(a => a.key === this.formConfig.treeNodeColumn);
    const message = 'Wilt u ' + this.formConfig.name + ' - ' + attribute.value + ' verwijderen?';
    this.confirmDialogService.confirm('Verwijderen',
    message, true)
      .pipe(take(1), filter(remove => remove))
      // tslint:disable-next-line: rxjs-no-ignored-subscription
      .subscribe(() => {
        this.removeFeatureFromDb();
      });*/
    console.error("to be implemented");
  }

  private removeFeatureFromDb() {
    console.error("to be implemented");
  }

  private removeSuccess() {
    this._snackBar.open('Verwijderd', '', {duration: 5000});
    this.features = this.removeFeature(this.features);
    this.feature = this.features[0];
  }

  private removeFeature(features: Feature[]): Feature[] {
    let fs = [];
    fs = [...features.filter(f => f !== this.feature)];
    fs.forEach(f=>{
      f.children = this.removeFeature(f.children);
    });
    return fs;
  }

  public newItem(evt) {
    const type = evt.srcElement.id;
    this.formConfig = this.formConfigs.config[type];
    const name = 'Nieuwe '  + this.formConfig.name;
   /* const labelAttribute: FeatureAttribute = {
      key: this.formConfig.treeNodeColumn,
      type: FormFieldType.TEXTFIELD,
      value: name,
      column: 1,
      tab: 1,
    };
    const parentFeature = this.features[0];
    const relations = this.formConfig.relation.relation;
    const relatedColumns = [];
    relations.forEach(r => {
      const relatedKey = r.relatedFeatureColumn;
      const mainKey = r.mainFeatureColumn;
      const relatedColumn = {
        key:  relatedKey,
        type: FormFieldType.HIDDEN,
        value: parentFeature.attributes.find(a => a.key === mainKey).value,
        column: 1,
        tab: 1,
      };
      relatedColumns.push(relatedColumn);

    });
    const newFeature = {
      id: null,
      attributes: [...relatedColumns, labelAttribute],
      isRelated: true,
    };
    parentFeature.children.push(newFeature);
    this.feature = newFeature;
    this.features = [...this.features];*/
    console.error("to be implemented");
    this.initForm();
  }

  public closeDialog() {
    if(this.formDirty){
      this.closeNotification(function(){this.dialogRef.close();});
    }else{
      this.dialogRef.close();
    }
  }

  private closeNotification(afterAction){
    this.confirmDialogService.confirm('Paspoort sluiten',
    'Wilt u het paspoort sluiten? Niet opgeslagen wijzigingen gaan verloren.', true)
    .pipe(take(1), filter(remove => remove))
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    .subscribe(() => {
      afterAction.call(this);
    });
  }

}
