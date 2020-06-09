import { Component, Inject, OnDestroy,Input } from '@angular/core';
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
import {FormHelpers} from "./form-helpers";
import {FormActionsService} from "../form-actions/form-actions.service";

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
               private confirmDialogService: ConfirmDialogService,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private _snackBar: MatSnackBar,
               public actions : FormActionsService) {
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

  public newItem(evt) {
    this.subscriptions.add(
      this.actions.newItem(evt, this.formConfigs, this.features).subscribe(features => {
        this.features = features.features;
        this.feature = features.feature;
        this.initForm();
      })
    );
  }

  public remove(){
    const attribute = Object.keys(this.feature).find(attribute => attribute === this.formConfig.treeNodeColumn);
    const message = 'Wilt u ' + this.formConfig.name + ' - ' + this.feature[attribute] + ' verwijderen?';
    this.confirmDialogService.confirm('Verwijderen',
      message, true)
      .pipe(take(1), filter(remove => remove)).subscribe(() => {
       this.actions.removeFeature(this.feature, this.features).subscribe(result=>{
          this.features = result.features;
          this.feature = result.features[0];
        });
      });
  }

  public closeDialog() {
    if(this.formDirty){
      this.closeNotification(function(){this.dialogRef.close();});
    }else{
      this.dialogRef.close();
    }
  }

  private closeNotification(afterAction){
    this.confirmDialogService.confirm('Formulier sluiten',
    'Wilt u het formulier sluiten? Niet opgeslagen wijzigingen gaan verloren.', true)
    .pipe(take(1), filter(remove => remove))
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    .subscribe(() => {
      afterAction.call(this);
    });
  }

}
