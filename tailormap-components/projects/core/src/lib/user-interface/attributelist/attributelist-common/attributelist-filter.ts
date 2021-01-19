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
    maxFeatures: -1,
  };

  public layerFilterValues: LayerFilterValues = {
    layerId: 0,
    columns: [],
  };

  private valueFilter = '';

  private relatedFilter = '';

  private featureFilter = '';

  public initFiltering(colNames: string[]): void {
    if (this.layerFilterValues.columns.length === 0) {
      // Init the filter structure
      this.layerFilterValues.layerId = this.dataSource.params.layerId;
      for (const colName of colNames) {
        let filterColumn: FilterColumns;
        filterColumn = {name: colName, status: false, nullValue: false, filterType: null, uniqueValues: [], criteria: null};
        this.layerFilterValues.columns.push(filterColumn);
      };
    }
  }

  public setRelatedFilter(relatedFilter: string): void {
    this.relatedFilter = relatedFilter;
  }

  public getRelatedFilter(): string {
    return this.relatedFilter;
  }

  public setFeatureFilter(featureFilter: string) {
    this.featureFilter = featureFilter;
  }

  public getFeatureFilter(): string {
    return this.featureFilter;
  }

  public setValueFilter(filter: string): void {
    this.valueFilter = filter;
  }

  public getValueFilter(): string {
    return this.valueFilter;
  }

  private getValueFilterCombinedWithFeatureFilter(): string {
    let filter = '';
    if (this.valueFilter) {
      filter = this.valueFilter;
    }
    if (this.featureFilter) {
      filter = this.featureFilter;
    }
    if (this.featureFilter && this.valueFilter) {
      filter = this.valueFilter + ' AND (' + this.featureFilter + ')';
    }
    return filter;
  }

  private getValueFilterCombinedWithRelatedFilter(): string {
    let filter = '';
    if (this.valueFilter) {
      filter = this.valueFilter;
    }
    if (this.relatedFilter) {
      filter = this.relatedFilter;
    }
    if (this.relatedFilter && this.valueFilter) {
      filter = this.relatedFilter + ' AND ' + this.valueFilter;
    }
    return filter;
  }

  public updateValueFilterWithRelatedLayerFilter(filtermap: Map<number, AttributelistFilter>): void {
    let tempFilter = '';
    filtermap.forEach((filter, key) => {
      if (key !== -1) {
        if (filter.valueFilter && tempFilter) {
          tempFilter += ' AND ';
        }
        if (filter.valueFilter) {
          tempFilter += 'RELATED_LAYER(' +
            filter.dataSource.params.layerId + ',' +
            key + ',(' +
            filter.valueFilter + '))';
        }
      }
    });
    filtermap.get(-1).setRelatedFilter(tempFilter);
  }

  /**
   * Create the CQL filter string
   */
  public createFilter() {
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
            });
            this.valueFilter += ')';
          }
        } else {
          this.valueFilter += CriteriaHelper.convertConditionToQuery(c.criteria);
        }

      }
    });
  }

  public setFilter(attributelistForFilter: AttributelistForFilter, columnName: string): void {
    // Get the unique values for this column
    this.columnController = attributelistForFilter.columnController;
    this.valueParams.applicationLayer = this.dataSource.params.layerId;
    if (this.dataSource.params.hasDetail()) {
      this.valueParams.featureType = this.dataSource.params.featureTypeId;
      // this.valueParams.filter = this.dataSource.params.featureFilter;
    } else {
      delete this.valueParams.featureType;
      this.valueParams.filter = '';
    }
    this.valueParams.attributes = [];
    this.valueParams.attributes.push(columnName);
    this.valueService.uniqueValues$(this.valueParams).subscribe((data: UniqueValuesResponse) => {
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
            this.createFilter();
            this.createRelatedFilter();
            this.dataSource.params.valueFilter = this.valueFilter;
            attributelistForFilter.refreshTable();
          }
        });
      }
    });
  }

  public getFinalFilter(filtermap: Map<number, AttributelistFilter>): string {
    let filter = '';
    // build finalFeature for relatedTable (combine valuefilter with featurefilter)
    if (this.dataSource.params.featureTypeId !== -1) {
      filter = this.getValueFilterCombinedWithFeatureFilter();
    } else { // check if there are relatedFilters on the relatedTables and combine these with its own valueFilter and set relatedFilter
      let relFilter = '';
      filtermap.forEach((attributeListFilter, key) => {
        if (key !== -1) {
          if (attributeListFilter.relatedFilter && relFilter) {
            relFilter += ' AND ';
          }
          if (attributeListFilter.relatedFilter) {
            relFilter += attributeListFilter.relatedFilter;
          }
        }
      });
      this.relatedFilter = relFilter;
      filter = this.getValueFilterCombinedWithRelatedFilter();
    }
    return filter;
  }

  private createRelatedFilter(): void {
    // -1 is the mainTable feature
    if (this.dataSource.params.featureTypeId !== -1) {
      let filter = '';
      if (this.getValueFilterCombinedWithFeatureFilter()) {
        filter += 'RELATED_LAYER(' +
          this.dataSource.params.layerId + ',' +
          this.dataSource.params.featureTypeId + ',(' +
          this.getValueFilterCombinedWithFeatureFilter() + '))';
      }
      this.relatedFilter = filter;
    }
  }

  public clearFilterForLayer(filtermap: Map<number, AttributelistFilter>, rowsChecked: boolean): void {
    this.clearFilterOnColumns();
    this.valueFilter = '';
    if (this.dataSource.params.featureTypeId !== -1) {
      this.featureFilter = '';
    }
    if (!rowsChecked) {
      this.createRelatedFilter();
    } else {
      this.featureFilter = filtermap.get(-1).getFeatureFilter();
      this.createRelatedFilter();
    }
    filtermap.forEach((attributeListFilter, key) => {
      // clear for relatedLayer
      if (key !== -1) {
        console.log('clear related filter');
      } else { // clear for mainLayer
        console.log('clear main filter');
      }
    })
  }

  public clearFilter(attributelistForFilter: AttributelistForFilter): void {
    this.clearFilterOnColumns();

    this.valueFilter = '';
    this.relatedFilter = '';
    this.featureFilter = '';
    this.dataSource.params.featureFilter = '';
    this.dataSource.params.featureFilter = '';
    this.dataSource.params.valueFilter = '';
    this.createFilter();
  }

  private clearFilterOnColumns(): void {
    this.layerFilterValues.columns.forEach((c) => {
      c.status = false;
      c.criteria = null;
      c.uniqueValues = [];
      c.filterType = '';
    });
  }

  public getAttributeType (columnName: string): AttributeTypeEnum {
    return AttributeTypeHelper.getAttributeType(this.columnController.getAttributeForColumnName(columnName))
  }

}
