import { StatisticType } from '../../../shared/statistic-service/statistic-models';

export interface LayerStatisticValues {
  layerId: number;
  columns: StatisticColumn[];
}

export interface StatisticColumn {
  name: string;
  statisticType: StatisticType;
  statisticValue: number;
  processing: boolean;
}

export enum StatisticTypeInMenu {
  SUM = 'Som',
  MIN = 'Min',
  MAX = 'Max',
  AVERAGE = 'Gem.',
  COUNT = 'Aantal',
  NONE = 'Geen',
}
