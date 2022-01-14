export interface FormChildRelation {
  label: string;
  featureType: string;
  column: string;
  referenceColumn: string;
}

export interface FormRelationModel {
  featureType: string;
  relations: FormChildRelation[];
}
