import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface LayerNameChooserData {
  name: string;
}

@Component({
  selector: 'tailormap-analysis-attribute-list-layer-name-chooser',
  templateUrl: './analysis-attribute-list-layer-name-chooser.component.html',
  styleUrls: ['./analysis-attribute-list-layer-name-chooser.component.css'],
})
export class AnalysisAttributeListLayerNameChooserComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AnalysisAttributeListLayerNameChooserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LayerNameChooserData) { }

  public ngOnInit(): void {
  }

  public onNoClick(): void {
    this.dialogRef.close({});
  }
}
