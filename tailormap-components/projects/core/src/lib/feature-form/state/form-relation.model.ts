export interface FeatureChildRelation {
  label: string;
  featureType: string;
  column: string;
  referenceColumn: string;
}

export interface FeatureRelationModel {
  featureType: string;
  relations: FeatureChildRelation[];
}
