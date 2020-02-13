
export interface Feature {
  id: string;
  featureType: string;
  featureSource: string;
  attributes: FeatureAttribute[];
  children?: Feature[];
  appLayer: string;
  isRelated: boolean;
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

export interface HiddenAttribute extends Attribute {
  key: string;
  type: FormFieldType.HIDDEN;
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
  newPossible: boolean;
  featureType: string;
  tabConfig: Map<number, string>;
  relation ?: FormRelation;
}

export interface FormRelation {
  relatedFeatureType: string;
  relation: RelatedColumn[];
}

export interface RelatedColumn {
  mainFeatureColumn: string;
  relatedFeatureColumn: string;
}

export interface DialogData {
  formFeatures: Feature[];
  formConfigs: FormConfigurations;
  applicationId: string;
  isBulk: boolean;
  lookup: Map<string, string>;
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
  HIDDEN = 'hidden',
}

export interface FlamingoApplayer {
  id: number;
  layername: string;
  attributes: FlamingoAttribute[];
  serviceId: number;
}

export interface FlamingoAttribute {
  filterable: boolean;
  longname: string;
  folder_label: string;
  visible: boolean;
  editable: boolean;
  defaultValue: string;
  selectable: boolean;
  disallowNullValue: boolean;
  type: string;
  disableUserEdit: boolean;
  allowValueListOnly: boolean;
  editHeight: string;
  automaticValue: boolean;
  valueList: string;
  name: string;
  featureType: number;
  editAlias: string;
  alias: string;
  id: number;
}
