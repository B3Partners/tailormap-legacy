import { LayerStatisticValues, StatisticColumns, StatisticTypeInMenu } from './attributelist-statistic-models';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { StatisticParameters, StatisticResponse, StatisticType } from '../../../shared/statistic-service/statistic-models';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

export class AttributelistStatistic {

  public layerStatisticValues: LayerStatisticValues = {
    layerId: 0,
    columns: [],
  }

  public statisticParams: StatisticParameters = {
    application: 0,
    appLayer: 0,
    column: '',
    type: StatisticType.NONE,
  }
  private columns: AttributeListColumnModel[];

  constructor(
    private statisticsService: StatisticService,
    private layerId: string,
  ) {
  }

  public initStatistics(columns: AttributeListColumnModel[]): void {
    this.columns = columns;
    const colNames = columns.map(c => c.name);
    this.layerStatisticValues.layerId = +(this.layerId);
    for (const colName of colNames) {
      let statisticColumn: StatisticColumns;
      statisticColumn = {name: colName, statisticType: StatisticType.NONE, statisticValue: null, processing: false};
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
      this.layerStatisticValues.columns[colIndex].processing = true;
      this.statisticsService.statisticValue$(this.statisticParams).subscribe((data: StatisticResponse) => {
        if (data.success) {
          this.layerStatisticValues.columns[colIndex].processing = false;
          this.layerStatisticValues.columns[colIndex].statisticType = statisticType;
          this.layerStatisticValues.columns[colIndex].statisticValue = data.result;
        }
      })
    }
  }

  public refreshStatistics (layerId: number, valueFilter: string) {
    this.layerStatisticValues.columns.forEach( col => {
      if (col.statisticType !== StatisticType.NONE) {
        this.setStatistics(col.name, col.statisticType, layerId, valueFilter);
      }
    })
  }

  private isStatisticViewable (colIndex: number): boolean {
    // const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    return  (this.layerStatisticValues.columns[colIndex].statisticType !== StatisticType.NONE &&
      this.layerStatisticValues.columns[colIndex].statisticValue !== null &&
      typeof (this.layerStatisticValues.columns[colIndex].statisticValue) === 'number')
  }

  public getStatisticTypeInMenu(colName: string): string {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    let result = '';
    if (colIndex >= 0) {
        result = StatisticTypeInMenu[this.layerStatisticValues.columns[colIndex].statisticType];
    }
    return result;
  }

  public getStatisticValue(colName: string): string {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    let result = '';
    if (colIndex >= 0) {
      if (this.isStatisticViewable(colIndex)) {
        // Round the numbers to 0 or 2 decimals
        // NOTE: Some columns with integer values are defined as double, so we will see 2 unexpected fractionDigits
        if (this.layerStatisticValues.columns[colIndex].statisticType === StatisticType.COUNT ||
          this.getColumnType(colName) === 'integer') {
          result = this.layerStatisticValues.columns[colIndex].statisticValue.toFixed();
        } else {
          result = this.layerStatisticValues.columns[colIndex].statisticValue.toFixed(2);
        }
      }
    }
    return result;
  }

  public getStatisticResult(colName: string): string {
    let result = this.getStatisticValue(colName);
    if (result !== '') {
      result = this.getStatisticTypeInMenu(colName) + ' = ' + result;
    }
    return result;
  }
  /**
   * Returns numeric when statistic functions like min, max, average are possible
   */
  public getStatisticFunctionColumnType(name: string): string {
    let type = this.getColumnType(name);
    if (type === 'integer' || type === 'double' || type === 'number') {
      type = 'numeric';
    }
    return type;
  }

  public isStatisticsProcessing(colName: string): boolean {
    const colIndex = this.layerStatisticValues.columns.findIndex(obj => obj.name === colName);
    let result = false;
    if (colIndex >= 0) {
      result = this.layerStatisticValues.columns[colIndex].processing
    }
    return result;
  }

  private getColumnType(columName: string) {
    const col = this.columns.find(c => c.name === columName);
    if (col) {
      return col.dataType;
    }
    return '';
  }


}
