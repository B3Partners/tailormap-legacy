
export interface FormFeature {
  id : string;
  featureType: string;
  featureSource: string;
  attributes: FeatureAttribute[];
}

export interface FeatureAttribute{
    key: string;
    value: string;
    type?: string;
}