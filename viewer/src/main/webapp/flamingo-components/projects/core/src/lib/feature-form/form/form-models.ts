export interface FormConfigurations {
  config: Map <string, FormConfiguration> ;
}

export interface FormConfiguration {
  fields: Attribute[];
  tabs: number;
  name: string;
  treeNodeColumn: string;
  idInTreeNodeColumn?: boolean;
  newPossible: boolean;
  featureType: string;
  tabConfig: Map<number, string>;
  relation ?: FormRelation;
}

export interface Attribute {
  key: string;
  type: FormFieldType;
  options ?: SelectOption[];
  column: number;
  tab: number;
}

export interface FeatureAttribute extends Attribute {
  key: string;
  //type: FormFieldType;
  value: string;
}

export enum FormFieldType {
  TEXTFIELD = 'textfield',
  SELECT = 'select',
  HIDDEN = 'hidden',
}


export interface SelectOption {
  label: string;
  val: string;
}

export interface FormRelation {
  relatedFeatureType: string;
  relation: RelatedColumn[];
}

export interface RelatedColumn {
  mainFeatureColumn: string;
  relatedFeatureColumn: string;
}

export interface IndexedFeatureAttributes {
  attrs: Map<string, FeatureAttribute>;
}

export interface TabbedFields {
  tabs: Map<number, ColumnizedFields>;
}

export interface ColumnizedFields {
  columns: Map<number, Attribute[]>;
}
