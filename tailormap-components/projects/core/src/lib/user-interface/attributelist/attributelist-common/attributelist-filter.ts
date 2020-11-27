import {
  FilterColumns,
  FilterValueSettings,
  LayerFilterValues,
} from './attributelist-filter-models';
import {
  UniqueValuesResponse,
  ValueParameters,
} from '../../../shared/value-service/value-models';
import {
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AttributeDataSource } from './attributelist-datasource';
import { AttributelistFilterValuesFormComponent } from '../attributelist-filter-values-form/attributelist-filter-values-form.component';
import { ValueService } from '../../../shared/value-service/value.service';
import { AttributelistRefresh } from './attributelist-models';

export class AttributelistFilter {

  constructor(
    private dataSource: AttributeDataSource,
    private valueService: ValueService,
    private dialog: MatDialog,
  ) {
  }

  private valueParams: ValueParameters = {
    applicationLayer: 0,
    attributes: [],
  }

  public layerFilterValues: LayerFilterValues = {
    layerId: 0,
    columns: [],
  };

  private valueFilter: string;

  public initFiltering(colNames: string[]): void {
    // Init the filter structure
    this.layerFilterValues.layerId = this.dataSource.params.layerId;
    // const colNames = this.getColumnNames();
    for (const colName of colNames) {
      let filterColumn: FilterColumns;
      filterColumn = {name: colName, status: false, nullValue: false, uniqueValues: []};
      this.layerFilterValues.columns.push(filterColumn);
    }
  }

  /**
   * Create the CQL filter string
   */
  public createFilter(): string {
    this.valueFilter = '';
    let filteredColumns = 0;
    this.layerFilterValues.columns.forEach((c) => {
      if (c.status) {
        filteredColumns++;
        if (filteredColumns === 1) {
          this.valueFilter = ' ';
        } else {
          this.valueFilter += ' AND';
        }
        if (c.nullValue) {
          this.valueFilter += ' ' + c.name + ' IS NULL';
        } else {
          this.valueFilter += ' ' + c.name + ' IN (';
          let filteredValues = 0;
          let quote = '';
          c.uniqueValues.forEach((v) => {
            if (v.select) {
              filteredValues++;
              if (filteredValues === 1) {
                if (typeof(v.value) === 'string') {
                  quote = '\'';
                }
              } else {
                this.valueFilter += ',';
              }
              this.valueFilter += quote + v.value + quote;
            }
          })
          this.valueFilter += ')';
        }
      }
    })
    return this.valueFilter;
  }

  public setFilter(attributelistRefresh: AttributelistRefresh, columnName: string): void {
    // Get the unique values for this column
    this.valueParams.applicationLayer = this.dataSource.params.layerId;
    this.valueParams.attributes = [];
    this.valueParams.attributes.push(columnName);
    this.valueService.uniqueValues(this.valueParams).subscribe((data: UniqueValuesResponse) => {
      if (data.success) {
        let uniqueValues: FilterValueSettings[];
        uniqueValues = [];
        const colObject = this.layerFilterValues.columns.find(c => c.name === columnName);
        const colIndex = this.layerFilterValues.columns.findIndex(obj => obj.name === columnName);
        if (colObject.uniqueValues.length === 0) {

          data.uniqueValues[columnName].forEach(val => {
            let filterValueSettings: FilterValueSettings;
            filterValueSettings = {value: val, select: true};
            uniqueValues.push(filterValueSettings);
          })
        } else {
          colObject.uniqueValues.forEach(val => uniqueValues.push(Object.assign({}, val)))
        }

        const config = new MatDialogConfig();
        config.data = {
          colName: columnName,
          values: uniqueValues,
        };
        const dialogRef = this.dialog.open(AttributelistFilterValuesFormComponent, config);
        dialogRef.afterClosed().subscribe(filterSetting => {
          // Do the filtering
          if (filterSetting !== 'CANCEL') {
            if (filterSetting === 'ON') {
              this.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
              this.layerFilterValues.columns[colIndex].nullValue = false;
              this.layerFilterValues.columns[colIndex].status = true;
            } else if (filterSetting === 'NONE') {
              this.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
              this.layerFilterValues.columns[colIndex].nullValue = true;
              this.layerFilterValues.columns[colIndex].status = true;
            } else if (filterSetting === 'OFF') {
              this.layerFilterValues.columns[colIndex].uniqueValues = [];
              this.layerFilterValues.columns[colIndex].nullValue = false;
              this.layerFilterValues.columns[colIndex].status = false;
            }
            this.dataSource.params.valueFilter = this.createFilter();
            attributelistRefresh.refreshTable();
          }
        });
      }
    });
  }
}
