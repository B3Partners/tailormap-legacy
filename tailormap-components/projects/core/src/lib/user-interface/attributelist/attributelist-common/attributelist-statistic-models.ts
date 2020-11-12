export interface LayerStatisticValues {
  layerId: number;
  columns: StatisticColumns[];
}

export interface StatisticColumns {
  name: string;
  statisticType: string;
  statisticValue: number;
}

export enum StatisticTypeText {
  SUM = 'Sum',
  MIN = 'Min',
  MAX = 'Max',
  AVERAGE = 'Gem',
  COUNT = 'N',
  NONE = '',
}
