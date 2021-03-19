import { AttributeListColumnModel } from './attribute-list-column-models';
import { AttributeListRowModel } from './attribute-list-row.model';
import { AttributeListFilterModel } from './attribute-list-filter-models';
import { AttributeListStatisticColumnModel } from './attribute-list-statistic-column.model';

export interface CheckedFeature extends Record<string, string> {
  rowId: string;
}

export interface AttributeListFeatureTypeData {
  layerId: string;
  featureType: number;
  featureTypeName: string;
  parentFeatureType?: number;
  columns: AttributeListColumnModel[];
  showPassportColumnsOnly: boolean;
  rows: AttributeListRowModel[];
  checkedFeatures: CheckedFeature[];
  filter: AttributeListFilterModel[];
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
  statistics: AttributeListStatisticColumnModel[];
}

