import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface LayerNameChoserData {
  name: string;
}

@Component({
  selector: 'tailormap-attributelist-layername-chooser',
  templateUrl: './attributelist-layername-chooser.component.html',
  styleUrls: ['./attributelist-layername-chooser.component.css'],
})
export class AttributelistLayernameChooserComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AttributelistLayernameChooserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LayerNameChoserData) { }

  public ngOnInit(): void {
  }

  public onNoClick(): void {
    this.dialogRef.close({

    });
  }
}
