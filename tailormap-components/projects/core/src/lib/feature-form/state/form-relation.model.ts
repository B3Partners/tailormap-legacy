export interface FormChildRelation {
  label: string;
  featureType: string;
  column: string;
  referenceColumn: string;
  currentRelation?: any | undefined;
}

export interface FormRelationModel {
  featureType: string;
  relations: FormChildRelation[];
}
