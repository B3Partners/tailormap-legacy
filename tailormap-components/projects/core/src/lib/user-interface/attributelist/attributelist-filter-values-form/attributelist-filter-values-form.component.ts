import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UniqueValues } from '../attributelist-common/attributelist-filter-models';

@Component({
  selector: 'tailormap-attributelist-filter-values-form',
  templateUrl: './attributelist-filter-values-form.component.html',
  styleUrls: ['./attributelist-filter-values-form.component.css'],
})
export class AttributelistFilterValuesFormComponent implements OnInit {

  public values: UniqueValues;

  // public layerFilterValues: LayerFilterValues;

  public colName: string;

  public allOn: boolean

  constructor(private dialogRef: MatDialogRef<AttributelistFilterValuesFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    // let layerId = data.layerFilterValues.layerId;
    // this.colName = data.layerFilterValues.columns[0]
    this.colName = data.colName;
    this.values = data.values;
    this.allOn = true
    this.updateSelected();
  }

  public ngOnInit(): void {
  }

  public updateSelected() {
    if (Array.isArray(this.values)) {
      this.allOn = this.values != null && this.values.every(v => v.select)
    }
  }

  public someSelected() {
    if (this.values === null) {
      return false;
    }
    let result = false;
    if (Array.isArray(this.values)) {
      result = this.values.filter(v => v.select).length > 0 && !this.allOn;
    }
    return result;
  }

  public setAll (select: boolean) {
    this.allOn = select;
    if (this.values === null) {
      return;
    }
    if (Array.isArray(this.values)) {
      this.values.forEach(v => v.select = select);
    }
  }

  public onOk() {
    console.log ('Filter zetten op waarden: ');
    if (Array.isArray(this.values)) {
      this.values.forEach(v => {
        if (v.select) {
          console.log('  ' + v.key);
        }
      })
    }

    this.dialogRef.close((this.someSelected()) ? 'ON' : 'OFF');
  }

  public onCancel() {
    this.dialogRef.close('CANCEL');
  }

}

