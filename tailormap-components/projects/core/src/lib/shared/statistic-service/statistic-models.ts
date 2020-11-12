// Parameters as defined in viewer/src/main/java/nl/b3p/viewer/stripes/StatisticAnalysisActionBean.java

export interface StatisticParameters {
  application: number;
  appLayer: number;
  column: string;
  type: string; // Statistic type: SUM, MIN, MAX etc
  featureType?: number
  filter?: string;
}

export interface StatisticResponse {
  result: number;
  success: boolean;
}
