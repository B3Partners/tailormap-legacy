import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { deleteColumnFilter, setColumnFilter } from '../state/attribute-list.actions';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { FilterDialogData } from '../models/attribute-list-filter.model';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListUniqueFilterValueSettings } from '../models/attribute-list-filter-models';

@Component({
  selector: 'tailormap-attribute-list-filter',
  templateUrl: './attribute-list-filter.component.html',
  styleUrls: ['./attribute-list-filter.component.css'],
})
export class AttributeListFilterComponent implements OnInit {

  public filterTypeSelected: string;
  public criteriaValue = new FormControl();
  public uniqueValues: AttributeListUniqueFilterValueSettings[] = [];
  public allOn: boolean
  public isLoadingUniqueValuesData: boolean;

  constructor(public dialogRef: MatDialogRef<AttributeListFilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FilterDialogData,
              private store$: Store<AttributeListState>,
              private metadataService: MetadataService) { }

  public ngOnInit(): void {
    if (this.data.filter) {
      this.filterTypeSelected = this.data.filter.type;
      if (this.filterTypeSelected === 'UniqueValues') {
        this.loadUniqueValues();
      } else {
        this.criteriaValue.setValue(this.data.filter.value);
      }
    }
  }

  private getFilterValue(): string[] {
    if (this.filterTypeSelected !== 'UniqueValues') {
      return [this.criteriaValue.value];
    } else {
      return this.getSelectedUniqueValues();
    }
  }

  private getSelectedUniqueValues(): string[] {
    const value: string[] = [];
    this.uniqueValues.forEach(v => {
      if (v.select) {
        value.push(v.value);
      }
    });
    return value;
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
    this.allOn = this.uniqueValues != null && this.uniqueValues.every(v => v.select)
  }
  public trackByValue(index: number, value: AttributeListUniqueFilterValueSettings): string {
    return value.value;
  }

  public loadUniqueValues(): void {
    this.isLoadingUniqueValuesData = true;
    if (this.uniqueValues.length > 0) {
      this.isLoadingUniqueValuesData = false;
      return;
    }
    this.metadataService.getUniqueValuesForAttribute$(this.data.layerId, this.data.columnName, this.data.featureType).
    subscribe(response =>
      {
        if (response.success) {
          response.uniqueValues[this.data.columnName].forEach(value => {
            this.uniqueValues.push({
              value,
              select: true,
            })
          });
          // this.updateSelected();
          this.allOn = true;
        }
      },
      () => {
        this.isLoadingUniqueValuesData = false;
      },
      () => {
        this.isLoadingUniqueValuesData = false;
      });
  }
}
