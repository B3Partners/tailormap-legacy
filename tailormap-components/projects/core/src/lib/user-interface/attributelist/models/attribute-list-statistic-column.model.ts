import { StatisticType } from '../../../shared/statistic-service/statistic-models';

export interface AttributeListStatisticColumnModel {
  name: string;
  statisticType: StatisticType;
  statisticValue: number;
  processing: boolean;
}
