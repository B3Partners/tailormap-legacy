// Parameters as defined in viewer/src/main/java/nl/b3p/viewer/stripes/UniqueValuesActionBean.java

export interface ValueParameters {
  applicationLayer: number;  // appLayer in export-models?
  featureType?: number;
  attributes: string[];
  attribute?: string;
  operator?: string;
  maxFeatures?: number;
  filter?: string;
}

export interface UniqueValuesResponse {
  uniqueValues: AttributeUniqueValues[];
  success: boolean;
}

export interface AttributeUniqueValues {
  [key: string]: string[];
}
