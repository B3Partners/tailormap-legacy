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
import { AttributelistForFilter } from './attributelist-models';
import { CriteriaHelper } from '../../../analysis/criteria/helpers/criteria.helper';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributelistColumnController } from './attributelist-column-controller';

export class AttributelistFilter {

  private columnController: AttributelistColumnController;

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
    if (this.layerFilterValues.columns.length === 0) {
      // Init the filter structure
      this.layerFilterValues.layerId = this.dataSource.params.layerId;
      for (const colName of colNames) {
        let filterColumn: FilterColumns;
        filterColumn = {name: colName, status: false, nullValue: false, filterType: null, uniqueValues: [], criteria: null};
        this.layerFilterValues.columns.push(filterColumn);
      }
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
        if (c.filterType === 'UniqueValues') {
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
        } else {
          this.valueFilter += CriteriaHelper.convertConditionToQuery(c.criteria);
        }

      }
    })
    return this.valueFilter;
  }

  public setFilter(attributelistForFilter: AttributelistForFilter, columnName: string): void {
    // Get the unique values for this column
    this.columnController = attributelistForFilter.columnController;
    this.valueParams.applicationLayer = this.dataSource.params.layerId;
    this.valueParams.attributes = [];
    this.valueParams.attributes.push(columnName);
    this.valueService.uniqueValues(this.valueParams).subscribe((data: UniqueValuesResponse) => {
      if (data.success) {
        let uniqueValues: FilterValueSettings[];
        uniqueValues = [];
        const colObject = this.layerFilterValues.columns.find(c => c.name === columnName);
        const colIndex = this.layerFilterValues.columns.findIndex(obj => obj.name === columnName);
        const filterType = (colObject.filterType ? colObject.filterType : '');

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
          criteria: colObject.criteria,
          attributeType: this.getAttributeType(columnName),
          filterType,
        };
        const dialogRef = this.dialog.open(AttributelistFilterValuesFormComponent, config);
        dialogRef.afterClosed().subscribe(filterDialogSettings => {
          // Do the filtering
          if (filterDialogSettings !== undefined && filterDialogSettings.filterSetting !== 'CANCEL') {
            if (filterDialogSettings.filterSetting === 'OFF') {
              this.layerFilterValues.columns[colIndex].uniqueValues = [];
              this.layerFilterValues.columns[colIndex].nullValue = false;
              this.layerFilterValues.columns[colIndex].status = false;
            } else {
              this.layerFilterValues.columns[colIndex].filterType = filterDialogSettings.filterType;
              if (this.layerFilterValues.columns[colIndex].filterType !== 'UniqueValues') {
                this.layerFilterValues.columns[colIndex].criteria = filterDialogSettings.criteria;
                this.layerFilterValues.columns[colIndex].uniqueValues = [];
                this.layerFilterValues.columns[colIndex].nullValue = false;
                this.layerFilterValues.columns[colIndex].status = true;
              } else {
                this.layerFilterValues.columns[colIndex].criteria = null;
                if (filterDialogSettings.filterSetting === 'ON') {
                  this.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
                  this.layerFilterValues.columns[colIndex].nullValue = false;
                  this.layerFilterValues.columns[colIndex].status = true;
                } else if (filterDialogSettings.filterSetting === 'NONE') {
                  this.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
                  this.layerFilterValues.columns[colIndex].nullValue = true;
                  this.layerFilterValues.columns[colIndex].status = true;
                }
              }
            }
            this.dataSource.params.valueFilter = this.createFilter();
            attributelistForFilter.refreshTable();
          }
        });
      }
    });
  }

  public getAttributeType (columnName: string): AttributeTypeEnum {
    return AttributeTypeHelper.getAttributeType(this.columnController.getAttributeForColumnName(columnName))
  }

}
