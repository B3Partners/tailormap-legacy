import { StatisticType } from '../../../shared/statistic-service/statistic-models';

export interface LayerStatisticValues {
  layerId: number;
  columns: StatisticColumns[];
}

export interface StatisticColumns {
  name: string;
  statisticType: StatisticType;
  statisticValue: number;
  processing: boolean;
}

export enum StatisticTypeInMenu {
  SUM = 'Sum',
  MIN = 'Min',
  MAX = 'Max',
  AVERAGE = 'Gem',
  COUNT = 'Aantal',
  NONE = 'Geen',
}
