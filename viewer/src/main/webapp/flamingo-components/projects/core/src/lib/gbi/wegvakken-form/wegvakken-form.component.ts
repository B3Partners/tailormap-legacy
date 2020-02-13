import { Component, OnInit, Inject, Output } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, Feature, FormConfiguration, IndexedFeatureAttributes,
   FeatureAttribute, FormConfigurations, FormFieldType } from '../../shared/wegvakken-models';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { debounceTime, filter, take } from 'rxjs/operators';
@Component({
  selector: 'flamingo-wegvakken-form',
  templateUrl: './wegvakken-form.component.html',
  styleUrls: ['./wegvakken-form.component.css'],
})
export class WegvakkenFormComponent implements OnInit {

  public features: Feature[];
  public feature: Feature;
  public applicationId: string;
  public formConfig: FormConfiguration;
  public formConfigs: FormConfigurations;
  public indexedAttributes: IndexedFeatureAttributes;

  public isBulk: boolean;
  public formsForNew: FormConfiguration[] = [];
  public lookup: Map<string, string>;

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData,
               private confirmDialogService: ConfirmDialogService ) {
      this.formConfigs = data.formConfigs;
      this.applicationId = data.applicationId;
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

  public ngOnInit() {
  }

  private initForm() {
    this.formConfig = this.formConfigs.config[this.feature.featureType];
    this.indexedAttributes = this.convertFeatureToIndexed(this.feature);
  }

  public openForm(feature) {
    if (feature && !this.isBulk) {
      this.feature = feature;
      this.initForm();
    }
  }

  private convertFeatureToIndexed(feat: Feature): IndexedFeatureAttributes {
    const m = new Map<string, FeatureAttribute>();
    for (const attr of feat.attributes) {
      m.set(attr.key, attr);
    }
    return {attrs: m};
  }

  public remove() {
    const attribute = this.feature.attributes.find(a => a.key === this.formConfig.treeNodeColumn);


    const message = 'Wilt u ' + this.formConfig.name + ' - ' + attribute.value +' verwijderen?';
    this.confirmDialogService.confirm('Verwijderen',
    message, true)
      .pipe(take(1), filter(remove => remove))
      // tslint:disable-next-line: rxjs-no-ignored-subscription
      .subscribe(() => {
        const a =0;
      });
  }

  public newItem(evt) {
    const type = evt.srcElement.id;
    this.formConfig = this.formConfigs.config[type];
    const name = 'Nieuwe '  + this.formConfig.name;
    const labelAttribute: FeatureAttribute = {
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
      featureType: type,
      featureSource: null,
      attributes: [...relatedColumns, labelAttribute],
      appLayer: this.feature.appLayer,
      isRelated: true,
    };
    parentFeature.children.push(newFeature);
    this.feature = newFeature;
    this.features = [...this.features];
    this.initForm();
  }

  public closeDialog() {
    this.confirmDialogService.confirm('Paspoort sluiten',
    'Wilt u het paspoort sluiten? Niet opgeslagen wijzigingen gaan verloren.', true)
    .pipe(take(1), filter(remove => remove))
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    .subscribe(() => {
      this.dialogRef.close();
    });
  }
}
