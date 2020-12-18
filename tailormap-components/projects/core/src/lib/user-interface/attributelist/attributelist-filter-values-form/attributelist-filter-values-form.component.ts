import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AttributeTypeEnum } from '../../../analysis/models/attribute-type.enum';
import { CriteriaHelper } from '../../../analysis/criteria/helpers/criteria.helper'
import { CriteriaModel } from '../../../analysis/models/criteria.model';
import { FilterValueSettings } from '../attributelist-common/attributelist-filter-models';
import { CriteriaConditionModel } from '../../../analysis/models/criteria-condition.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tailormap-attributelist-filter-values-form',
  templateUrl: './attributelist-filter-values-form.component.html',
  styleUrls: ['./attributelist-filter-values-form.component.css'],
})
export class AttributelistFilterValuesFormComponent implements OnInit {

  public values: FilterValueSettings[];
  public criteriaValue = new FormControl();
  public colName: string;

  public allOn: boolean

  public criteria: CriteriaConditionModel;

  public filterTypeSelected: string = '';
  public filterTypes: string[] = ['Contains', 'NotContains', 'UniqueValue'];

  constructor(private dialogRef: MatDialogRef<AttributelistFilterValuesFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.colName = data.colName;
    this.values = data.values;
    this.allOn = true;
    this.criteria = new class implements CriteriaConditionModel {
      attribute: string;
      attributeType: AttributeTypeEnum;
      condition: string;
      id: string;
      source: number;
      value: string;
    };
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
    if (this.filterTypeSelected !== '' && this.filterTypeSelected !== 'UniqueValues') {
      this.criteria.id  = this.colName;
      this.criteria.attribute = this.colName;
      this.criteria.attributeType = AttributeTypeEnum.STRING; //CriteriaHelper.getAttributeType
      this.criteria.condition = this.filterTypeSelected;
      this.criteria.value = this.criteriaValue.value;
      // ter test even kijken of dit kan gaan werken:
      console.log("condition: " + CriteriaHelper.convertConditionToQuery(this.criteria));
    }

    this.dialogRef.close(filterSetting);
  }

  public onCancel() {
    this.dialogRef.close('CANCEL');
  }

}

