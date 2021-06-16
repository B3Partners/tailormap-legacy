import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Feature } from '../generated';
import { FormConfiguration } from '../../feature-form/form/form-models';
import { FormTreeHelpers } from '../../feature-form/form-tree/form-tree-helpers';

export interface FeatureSelectionComponentData {
  features: Feature[];
  formConfigs: Map<string, FormConfiguration>;
}

@Component({
  selector: 'tailormap-feature-selection',
  templateUrl: './feature-selection.component.html',
  styleUrls: ['./feature-selection.component.css'],
})
export class FeatureSelectionComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FeatureSelectionComponentData,
    private dialogRef: MatDialogRef<FeatureSelectionComponent, Feature>,
  ) { }

  public static openFeatureSelectionPopup(
    dialog: MatDialog,
    features: Feature[],
    formConfigs: Map<string, FormConfiguration>,
  ): MatDialogRef<FeatureSelectionComponent, Feature> {
    return dialog.open<FeatureSelectionComponent, FeatureSelectionComponentData, Feature>(FeatureSelectionComponent, {
      data: { features, formConfigs },
      width: '720px',
      height: '500px',
    });
  }

  public trackByFeatureId(idx: number, feature: Feature): string {
    return feature.fid;
  }

  public getLabelForFeature(feature: Feature) {
    const formConfig = this.data.formConfigs.get(feature.tablename);
    if (formConfig) {
      const treeName = FormTreeHelpers.getFeatureValueForField(feature, formConfig, formConfig.treeNodeColumn);
      return `${formConfig.name} (${feature.tablename}, ${treeName})`;
    }
    return feature.tablename;
  }

  public featureSelected(feature: Feature) {
    this.dialogRef.close(feature);
  }

  public close() {
    this.dialogRef.close(null);
  }

}
