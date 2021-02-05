import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';

export interface AttributeListTabModel {
  layerId: string;
  layerAlias: string;
  layerName: string;
  featureType: number;
  selectedRelatedFeatureType?: number;
  loadingData: boolean;
  loadingError?: string;
  relatedFeatures: RelatedFeatureType[];
}
