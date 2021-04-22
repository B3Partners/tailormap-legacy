export interface AttributeListTabModel {
  layerId: string;
  layerAlias: string;
  layerName: string;
  featureType: number;
  selectedRelatedFeatureType: number;
  loadingData: boolean;
  loadingError?: string;
}
