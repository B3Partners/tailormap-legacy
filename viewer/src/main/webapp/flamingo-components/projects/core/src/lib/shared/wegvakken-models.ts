
export interface Feature {
  id: string;
  featureType: string;
  featureSource: string;
  attributes: FeatureAttribute[];
  children?: Feature[];
}

export interface Attribute {
  key: string;
  type: string;
}
export interface FeatureAttribute extends Attribute {
    key: string;
    type: string;
    value: string;
}

export interface FormConfigurations {
  config: Map <string, FormConfiguration> ;
}

export interface FormConfiguration {
  fields: Attribute[];
  tabs: number;
  name: string;
}

export interface DialogData {
  formFeature: Feature;
  formConfig: FormConfigurations;
}

export interface DialogClosedData {
  iets: string;
}
