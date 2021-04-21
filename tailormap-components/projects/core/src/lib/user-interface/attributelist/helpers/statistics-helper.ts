import { AttributeListStatisticColumnModel } from '../models/attribute-list-statistic-column.model';
import { StatisticType } from '../../../shared/statistic-service/statistic-models';

const statisticOptions = [
  { type: StatisticType.SUM, label: 'Som' },
  { type: StatisticType.MIN, label: 'Min' },
  { type: StatisticType.MAX, label: 'Max' },
  { type: StatisticType.AVERAGE, label: 'Gem.' },
  { type: StatisticType.COUNT, label: 'Aantal' },
  { type: StatisticType.NONE, label: 'Geen' },
];

const statisticOptionsMap: Map<StatisticType, string> = new Map(statisticOptions.map(opt => [ opt.type, opt.label ]));

const statisticNumberTypes = new Set([StatisticType.SUM, StatisticType.MIN, StatisticType.MAX, StatisticType.AVERAGE]);

export class StatisticsHelper {

  public static getStatisticOptions() {
    return statisticOptions;
  }

  public static getLabelForStatisticType(type: StatisticType) {
    return statisticOptionsMap.get(type);
  }

  public static isStatisticTypeAvailable(type: StatisticType, columnDataType?: string) {
    if (!statisticNumberTypes.has(type)) {
      // non-number types are always available
      return true;
    }
    const dataType = (columnDataType || '').toLowerCase();
    const isNumberDataType = (dataType === 'integer' || dataType === 'double' || dataType === 'number');
    return statisticNumberTypes.has(type) && isNumberDataType;
  }

  public static getStatisticValue(columnDataType?: string, column?: AttributeListStatisticColumnModel): string {
    if (!column || !column.statisticValue || column.statisticType === StatisticType.NONE) {
      return null;
    }
    if (column.statisticType === StatisticType.COUNT || (columnDataType && columnDataType.toLowerCase() === 'integer')) {
      return column.statisticValue.toFixed();
    }
    return column.statisticValue.toFixed(2);
  }

}
