import { AttributeListColumnModel } from './attribute-list-column-models';
import { AttributeListRowModel } from './attribute-list-row.model';
import { FilterColumns } from './attribute-list-filter-models';

export interface AttributeListFeatureTypeData {
  layerId: string;
  featureType: number;
  featureTypeName: string;
  parentFeatureType?: number;
  columns: AttributeListColumnModel[];
  showPassportColumnsOnly: boolean;
  rows: AttributeListRowModel[];
  checkedFeatures: string[];
  filter: FilterColumns[];
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
}

