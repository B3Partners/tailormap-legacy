import { AttributeListFilterModels, LayerFilterValues } from './attribute-list-filter-models';

export interface AttributeListFilterModel {
  featureTypeId: number;
  filter: LayerFilterValues;
  valueFilter: string;
  relatedFilter: string;
  featureFilter: string;
}

export interface FilterDialogData {
  columnName: string;
  featureType: number
  layerId: string;
  filter: AttributeListFilterModels | null;
}


