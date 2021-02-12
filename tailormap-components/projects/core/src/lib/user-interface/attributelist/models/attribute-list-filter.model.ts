import { AttributeListFilterModel } from './attribute-list-filter-models';


export interface FilterDialogData {
  columnName: string;
  featureType: number
  layerId: string;
  filter: AttributeListFilterModel | null;
}


