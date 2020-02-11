import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, Feature, FormConfiguration, IndexedFeatureAttributes,
   FeatureAttribute, FormConfigurations } from '../../shared/wegvakken-models';

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

  constructor( public dialogRef: MatDialogRef<WegvakkenFormComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogData ) {
      this.formConfigs = data.formConfigs;
      this.applicationId = data.applicationId;
      this.features = data.formFeatures;
      this.feature = this.features[0];
      this.initForm();
  }

  public ngOnInit() {
  }

  private initForm() {
    this.formConfig = this.formConfigs.config[this.feature.featureType];
    this.indexedAttributes = this.convertFeatureToIndexed(this.feature);
  }

  public openForm(feature) {
    if (feature && this.features.length === 1) {
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

  public closeDialog() {
    this.dialogRef.close();
  }
}
