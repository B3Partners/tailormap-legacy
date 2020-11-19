// Parameters as defined in viewer/src/main/java/nl/b3p/viewer/stripes/StatisticAnalysisActionBean.java

export interface StatisticParameters {
  application: number;
  appLayer: number;
  column: string;
  type: StatisticType;
  featureType?: number
  filter?: string;
}

export interface StatisticResponse {
  result: number;
  success: boolean;
}

export enum StatisticType {
  SUM = 'SUM',
  MIN = 'MIN',
  MAX = 'MAX',
  AVERAGE = 'AVERAGE',
  COUNT = 'COUNT',
  NONE = 'NONE',
}
