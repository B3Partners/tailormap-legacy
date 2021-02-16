import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { deleteColumnFilter, setColumnFilter } from '../state/attribute-list.actions';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListFilterModel, FilterType } from '../models/attribute-list-filter-models';

interface AttributeListUniqueFilterValueSettings {
  // value in column.
  value: string;
  // value in filter selected
  select: boolean;
}

export interface FilterDialogData {
  columnName: string;
  featureType: number
  layerId: string;
  filter: AttributeListFilterModel | null;
}

@Component({
  selector: 'tailormap-attribute-list-filter',
  templateUrl: './attribute-list-filter.component.html',
  styleUrls: ['./attribute-list-filter.component.css'],
})
export class AttributeListFilterComponent implements OnInit {

  public filterTypeSelected: FilterType;
  public criteriaValue = new FormControl();
  public uniqueValues: AttributeListUniqueFilterValueSettings[] = [];
  public allOn: boolean
  public someOn: boolean;
  public isLoadingUniqueValuesData: boolean;

  constructor(public dialogRef: MatDialogRef<AttributeListFilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FilterDialogData,
              private store$: Store<AttributeListState>,
              private metadataService: MetadataService) { }

  public ngOnInit(): void {
    if (this.data.filter) {
      this.filterTypeSelected = this.data.filter.type;
      if (this.filterTypeSelected === FilterType.UNIQUE_VALUES) {
        this.loadUniqueValues();
      } else {
        this.criteriaValue.setValue(this.data.filter.value);
      }
    }
    this.updateCheckState();
  }

  private getFilterValue(): string[] {
    if (this.filterTypeSelected !== FilterType.UNIQUE_VALUES) {
      return [this.criteriaValue.value];
    } else {
      return this.getSelectedUniqueValues();
    }
  }

  private getSelectedUniqueValues(): string[] {
    return this.uniqueValues.filter(v => v.select).map(v => v.value);
  }

  public onOk() {
    this.store$.dispatch(setColumnFilter({
      filterType: this.filterTypeSelected,
      value: this.getFilterValue(),
      featureType: this.data.featureType,
      colName: this.data.columnName,
      layerId: this.data.layerId,
    }));

    this.dialogRef.close();
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onClear() {
    this.store$.dispatch(deleteColumnFilter({
      colName: this.data.columnName,
      featureType: this.data.featureType,
      layerId: this.data.layerId,
    }));

    this.dialogRef.close();
  }

  public setAll (select: boolean) {
    this.allOn = select;
    if (this.uniqueValues === null) {
      return;
    }
    this.uniqueValues.forEach(v => v.select = select);
  }

  public someSelected(): boolean {
    if (this.uniqueValues === null) {
      return false;
    }
    return this.uniqueValues.filter(v => v.select).length > 0 && !this.allOn;
  }

  public updateSelected(value: AttributeListUniqueFilterValueSettings) {
    value.select = !value.select;
    this.updateCheckState();
  }

  public updateCheckState() {
    this.allOn = this.uniqueValues != null && this.uniqueValues.every(v => v.select);
    this.someOn = this.someSelected();
  }

  public trackByValue(index: number, value: AttributeListUniqueFilterValueSettings): string {
    return value.value;
  }

  public loadUniqueValues(): void {
    if (this.uniqueValues.length > 0) {
      return;
    }
    this.isLoadingUniqueValuesData = true;
    const hasFilterValues = !!this.data.filter && this.data.filter.value.length > 0;
    const filterSet = new Set<string>(this.data.filter?.value || []);
    this.metadataService.getUniqueValuesForAttribute$(this.data.layerId, this.data.columnName, this.data.featureType)
      .subscribe(response => {
        if (response.success) {
          response.uniqueValues[this.data.columnName].forEach(value => {
            this.uniqueValues.push({
              value,
              select: !hasFilterValues || filterSet.has(value),
            });
          });
        }
      },
      () => {
        this.isLoadingUniqueValuesData = false;
      },
      () => {
        this.isLoadingUniqueValuesData = false;
        this.updateCheckState();
      });
  }
}
