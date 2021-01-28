import {
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import {
  FilterValueSettings,
  FilterDialogSettings,
} from '../models/attribute-list-filter-models';
import { CriteriaConditionModel } from '../../../analysis/models/criteria-condition.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tailormap-attributelist-filter-values-form',
  templateUrl: './attributelist-filter-values-form.component.html',
  styleUrls: ['./attributelist-filter-values-form.component.css'],
})

export class AttributelistFilterValuesFormComponent implements OnInit {

  @Input()
  public formControl: FormControl;

  public values: FilterValueSettings[];
  public criteriaValue = new FormControl();
  public colName: string;
  public attributeType: AttributeTypeEnum;
  public allOn: boolean

  public criteria: CriteriaConditionModel;
  public filterDialogSettings: FilterDialogSettings;
  public filterTypeSelected: string;
  public filterTypes: string[] = ['Contains', 'NotContains', 'UniqueValues'];

  constructor(private dialogRef: MatDialogRef<AttributelistFilterValuesFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.colName = data.colName;
    this.attributeType = data.attributeType;
    this.values = data.values;
    this.allOn = true;
    if (data.criteria !== null) {
      this.criteria = data.criteria;
      this.criteriaValue.setValue(this.criteria.value);
    }
    this.filterTypeSelected = data.filterType;
    this.criteria = {id: ''};
    this.filterDialogSettings = {
      criteria: this.criteria, filterSetting: '', filterType: '',
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
      this.criteria.attributeType = this.attributeType;
      this.criteria.condition = this.filterTypeSelected;
      this.criteria.value = this.criteriaValue.value;
      this.filterDialogSettings.filterSetting = 'ON';
      this.filterDialogSettings.criteria = this.criteria;
    }

    this.dialogRef.close( this.filterDialogSettings);
  }

  public onCancel() {
    this.filterDialogSettings.filterSetting = 'CANCEL';
    this.dialogRef.close( this.filterDialogSettings);
  }

  public onClear() {
    this.filterDialogSettings.filterSetting = 'OFF'
    this.dialogRef.close( this.filterDialogSettings);
  }

}

