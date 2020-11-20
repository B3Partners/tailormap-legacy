import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import {
  LayerStatisticValues,
  StatisticColumns,
  StatisticTypeText,
} from '../attributelist-common/attributelist-statistic-models';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import {
  StatisticParameters,
  StatisticResponse,
  StatisticType,
} from '../../../shared/statistic-service/statistic-models';

export class AttributelistStatistic {

  public layerStatisticValues: LayerStatisticValues = {
    layerId: 0,
    columns: [],
  }

  public statisticParams: StatisticParameters = {
    application: 0,
    appLayer: 0,
    column: '',
    type: null,
  }

  constructor(private statisticsService: StatisticService,
              private dataSource: AttributeDataSource) {
  }

  public initStatistics(colNames: string[]): void {
    // Init the statistics structure
    this.layerStatisticValues.layerId = this.dataSource.params.layerId;
    for (const colName of colNames) {
      let statisticColumn: StatisticColumns;
      statisticColumn = {name: colName, statisticType: StatisticType.NONE, statisticValue: null};
      this.layerStatisticValues.columns.push(statisticColumn);
    }
  }

  public setStatistics(colName: string, statisticType: StatisticType, layerId: number, filter: string) {
    this.statisticParams.appLayer = layerId;
    this.statisticParams.column = colName;
    this.statisticParams.type = StatisticType[statisticType];
    this.statisticParams.filter = filter;
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    if (statisticType === StatisticType.NONE) {
      this.layerStatisticValues.columns[colIndex].statisticType = statisticType;
      this.layerStatisticValues.columns[colIndex].statisticValue = null;
    } else {
      this.statisticsService.statisticValue$(this.statisticParams).subscribe((data: StatisticResponse) => {
        if (data.success) {
          this.layerStatisticValues.columns[colIndex].statisticType = statisticType;
          this.layerStatisticValues.columns[colIndex].statisticValue = data.result;
        }
      })
    }
  }

  public refreshStatistics (layerId: number, valueFilter: string) {
    this.layerStatisticValues.columns.forEach( col => {
      if (col.statisticType === StatisticType.NONE) {
        this.setStatistics(col.name, col.statisticType, layerId, valueFilter);
      }
    })
  }

  private isStatisticViewable (colName: string): boolean {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    return  (this.layerStatisticValues.columns[colIndex].statisticType !== StatisticType.NONE &&
      this.layerStatisticValues.columns[colIndex].statisticValue &&
      typeof (this.layerStatisticValues.columns[colIndex].statisticValue) === 'number')
  }

  public getStatisticTypeText(colName: string): string {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    let result = '';
    if (colIndex >= 0) {
      if (this.isStatisticViewable(colName)) {
        result = StatisticTypeText[this.layerStatisticValues.columns[colIndex].statisticType];
        if (result !== '') {
          result += '=';
        }
      }
    }
    return result;
  }

  public getStatisticValue(colName: string): string {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    let result: string;
    if (colIndex >= 0) {
      if (this.isStatisticViewable(colName)) {
        // Round the numbers to 0 or 2 decimals
        // NOTE: Some columns with integer values are defined as double, so we will see 2 unexpected fractionDigits
        if (this.layerStatisticValues.columns[colIndex].statisticType === StatisticType.COUNT ||
          this.dataSource.columnController.getColumnType(colName) === 'integer') {
          result = this.layerStatisticValues.columns[colIndex].statisticValue.toFixed();
        } else {
          result = this.layerStatisticValues.columns[colIndex].statisticValue.toFixed(2);
        }
      }
    }
    return result;
  }

  /**
   * Returns numeric when statistic functions like min, max, average are possible
   */
  public getStatisticFunctionColumnType(name: string): string {
    let type = this.dataSource.columnController.getColumnType(name);
    if (type === 'integer' || type === 'double' || type === 'number') {
      type = 'numeric';
    }
    return type;
  }

}
