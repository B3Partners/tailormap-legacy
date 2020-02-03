
export interface Feature {
  id: string;
  featureType: string;
  featureSource: string;
  attributes: FeatureAttribute[];
  children?: Feature[];
}

export interface Attribute {
  key: string;
  type: FormFieldType;
  options ?: SelectOption[];
  column: number;
  tab: number;
}

export interface TextAttribute extends Attribute {
  key: string;
  type: FormFieldType.TEXTFIELD;
  column: number;
  tab: number;
}
export interface SelectAttribute extends Attribute {
  key: string;
  type: FormFieldType.SELECT;
  options: SelectOption[];
  column: number;
  tab: number;
}

export interface SelectOption {
  label: string;
  val: string;
}

export interface FeatureAttribute extends Attribute {
  key: string;
  type: FormFieldType;
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

export enum FormFieldType {
  TEXTFIELD = 'textfield',
  SELECT = 'select',
}
