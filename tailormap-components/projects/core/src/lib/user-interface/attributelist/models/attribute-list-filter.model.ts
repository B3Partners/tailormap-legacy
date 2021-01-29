import { LayerFilterValues } from './attribute-list-filter-models';

export interface AttributeListFilterModel {
  featureTypeId: number;
  filter: LayerFilterValues;
  valueFilter: string;
  relatedFilter: string;
  featureFilter: string;
}
