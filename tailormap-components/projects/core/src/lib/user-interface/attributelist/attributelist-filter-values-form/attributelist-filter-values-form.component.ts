import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { FilterValueSettings } from '../attributelist-common/attributelist-filter-models';

@Component({
  selector: 'tailormap-attributelist-filter-values-form',
  templateUrl: './attributelist-filter-values-form.component.html',
  styleUrls: ['./attributelist-filter-values-form.component.css'],
})
export class AttributelistFilterValuesFormComponent implements OnInit {

  public values: FilterValueSettings[];
  public colName: string;

  public allOn: boolean

  constructor(private dialogRef: MatDialogRef<AttributelistFilterValuesFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.colName = data.colName;
    this.values = data.values;
    this.allOn = true
    this.updateSelected();
  }

  public ngOnInit(): void {
  }

  public updateSelected() {
    this.allOn = this.values != null && this.values.every(v => v.select)
  }

  public someSelected(): boolean {
    if (this.values === null) {
      return false;
    }

    return this.values.filter(v => v.select).length > 0 && !this.allOn;
  }

  public setAll (select: boolean) {
    this.allOn = select;
    if (this.values === null) {
      return;
    }
    this.values.forEach(v => v.select = select);
  }

  public onOk() {
    let filterSetting: string;
    if (this.allOn) {
      // When all values selected we do not need a filter
      filterSetting = 'OFF'
    } else if (this.someSelected()) {
      filterSetting = 'ON'
    } else {
      // no values are selected, so set the filter on NULL values
      filterSetting = 'NONE'
    }

    this.dialogRef.close(filterSetting);
  }

  public onCancel() {
    this.dialogRef.close('CANCEL');
  }

}

