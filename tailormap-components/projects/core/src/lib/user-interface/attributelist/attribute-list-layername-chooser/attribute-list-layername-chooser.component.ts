import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface LayerNameChoserData {
  name: string;
}

@Component({
  selector: 'tailormap-attribute-list-layername-chooser',
  templateUrl: './attribute-list-layername-chooser.component.html',
  styleUrls: ['./attribute-list-layername-chooser.component.css'],
})
export class AttributeListLayernameChooserComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AttributeListLayernameChooserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LayerNameChoserData) { }

  public ngOnInit(): void {
  }

  public onNoClick(): void {
    this.dialogRef.close({});
  }
}
