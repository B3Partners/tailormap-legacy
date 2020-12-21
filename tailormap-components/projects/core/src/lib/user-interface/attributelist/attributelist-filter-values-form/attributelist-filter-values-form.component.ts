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
import {
  FilterValueSettings,
  FilterDialogSettings
} from '../attributelist-common/attributelist-filter-models';
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
  public filterDialogSettings: FilterDialogSettings;
  public filterTypeSelected: string = '';
  public filterTypes: string[] = ['Contains', 'NotContains', 'UniqueValues'];

  constructor(private dialogRef: MatDialogRef<AttributelistFilterValuesFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.colName = data.colName;
    this.values = data.values;
    this.filterTypeSelected = data.filterType;
    this.allOn = true;
    this.criteria = new class implements CriteriaConditionModel {
      attribute: string;
      attributeType: AttributeTypeEnum;
      condition: string;
      id: string;
      source: number;
      value: string;
    };
    this.filterDialogSettings = new class FilterDialogSettings {
      filterType: string;
      filterSetting: string;
      criteria: CriteriaConditionModel;
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
    this.filterDialogSettings.filterType = this.filterTypeSelected;
    if (this.filterTypeSelected === 'UniqueValues') {
      if (this.allOn) {
        // When all values selected we do not need a filter
        this.filterDialogSettings.filterSetting = 'OFF'
      } else if (this.someSelected()) {
        this.filterDialogSettings.filterSetting = 'ON'
      } else {
        // no values are selected, so set the filter on NULL values
        this.filterDialogSettings.filterSetting = 'NONE'
      }
    } else if (this.filterTypeSelected !== '') {
      this.criteria.id  = this.colName;
      this.criteria.attribute = this.colName;
      this.criteria.attributeType = AttributeTypeEnum.STRING; //CriteriaHelper.getAttributeType
      this.criteria.condition = this.filterTypeSelected;
      this.criteria.value = this.criteriaValue.value;
      // ter test even kijken of dit kan gaan werken:
      // console.log("condition: " + CriteriaHelper.convertConditionToQuery(this.criteria));
      this.filterDialogSettings.filterSetting = 'ON';
      this.filterDialogSettings.criteria = this.criteria;
    }

    this.dialogRef.close( this.filterDialogSettings);
  }

  public onCancel() {
    this.filterDialogSettings.filterSetting = 'CANCEL';
    this.dialogRef.close( this.filterDialogSettings);
  }

}

