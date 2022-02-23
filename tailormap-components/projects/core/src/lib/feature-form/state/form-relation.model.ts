export interface FormChildRelation {
  label: string;
  featureType: string;
  column: string;
  referenceColumn: string;
  geometry?: string;
  currentRelation?: string | any;
}

export interface FormRelationModel {
  featureType: string;
  relations: FormChildRelation[];
}
