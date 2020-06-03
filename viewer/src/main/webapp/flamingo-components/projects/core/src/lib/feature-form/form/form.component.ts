import { Component, Inject, OnDestroy } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { filter, take } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import {DialogData} from "../form-popup/form-popup-models";
import {
  FormConfiguration,
  FormConfigurations,
} from "./form-models";
import {Feature} from "../../shared/generated";

@Component({
  selector: 'flamingo-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnDestroy {

  public features: Feature[];
  public feature: Feature;
  public formConfig: FormConfiguration;
  public formConfigs: FormConfigurations;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public lookup: Map<string, string>;
  public formDirty: boolean;

  private subscriptions = new Subscription();
  constructor( public dialogRef: MatDialogRef<FormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private confirmDialogService: ConfirmDialogService ,
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

    const parentFeature = this.features[0];
    const relations = this.formConfig.relation.relation;

    const newFeature = {
      id: null,
      clazz: type,
      isRelated: true,
    };
    newFeature[this.formConfig.treeNodeColumn] = name;
    relations.forEach(r => {
      const relatedKey = r.relatedFeatureColumn;
      const mainKey = r.mainFeatureColumn;
      newFeature[relatedKey] = parentFeature[mainKey];
    });
    parentFeature.children.push(newFeature);
    this.feature = newFeature;
    this.features = [...this.features];
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
