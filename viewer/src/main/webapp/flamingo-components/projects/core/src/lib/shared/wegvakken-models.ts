
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
  column: number;
  tab: number;
}
export interface FeatureAttribute extends Attribute {
    key: string;
    type: string;
    value: string;
}

export interface IndexedFeatureAttributes {
  attrs: Map<string, Attribute>;
}

export interface FormConfigurations {
  config: Map <string, FormConfiguration> ;
}

export interface FormConfiguration {
  fields: Attribute[];
  tabs: number;
  name: string;
  treeNodeColumn: string;
  tabConfig: Map<number, string>;
}

export interface DialogData {
  formFeature: Feature;
  indexedAttributes: IndexedFeatureAttributes;
  formConfigs: FormConfigurations;
}

export interface DialogClosedData {
  iets: string;
}


export interface TabbedFields {
  tabs: Map<number, ColumnizedFields>;
}

export interface ColumnizedFields {
  columns: Map<number, Attribute[]>;
}
