import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { deleteColumnFilter, setColumnFilter } from '../state/attribute-list.actions';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListFilterModel } from '../models/attribute-list-filter-models';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface FilterDialogData {
  columnName: string;
  featureType: number;
  layerId: string;
  filter: AttributeListFilterModel | null;
  columnType: AttributeTypeEnum;
}

@Component({
  selector: 'tailormap-attribute-list-filter',
  templateUrl: './attribute-list-filter.component.html',
  styleUrls: ['./attribute-list-filter.component.css'],
})
export class AttributeListFilterComponent implements OnInit {

  public uniqueValues$: Observable<string[]>;
  public filter: { condition?: string; value?: string | string[] } = {};

  constructor(public dialogRef: MatDialogRef<AttributeListFilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: FilterDialogData,
              private store$: Store<AttributeListState>,
              private metadataService: MetadataService) { }

  public ngOnInit(): void {
    this.uniqueValues$ = this.getUniqueValues$();
    if (!this.data.filter) {
      return;
    }
    this.filter = {
      condition: this.data.filter.name,
      value: this.data.filter.value,
    };
  }

  public onOk() {
    this.store$.dispatch(setColumnFilter({
      filterType: this.filter.condition,
      value: typeof this.filter.value === 'string' ? [ this.filter.value ] : this.filter.value,
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

  public getUniqueValues$(): Observable<string[]> {
    return this.metadataService.getUniqueValuesForAttribute$(this.data.layerId, this.data.columnName, this.data.featureType)
      .pipe(
        map(response => {
          if (response.success) {
            return response.uniqueValues[this.data.columnName];
          }
          return [];
        }),
      );
  }

  public updateFilter(filter: { condition: string; value: string | string[] }) {
    this.filter = filter;
  }

}
