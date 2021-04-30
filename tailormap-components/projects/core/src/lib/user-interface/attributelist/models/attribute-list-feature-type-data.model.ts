import { AttributeListColumnModel } from './attribute-list-column-models';
import { AttributeListRowModel } from './attribute-list-row.model';
import { AttributeListStatisticColumnModel } from './attribute-list-statistic-column.model';
import { AttributeFilterModel } from '../../../shared/models/attribute-filter.model';

export interface CheckedFeature extends Record<string, string> {
  rowId: string;
}

export interface AttributeListFeatureTypeData {
  layerId: string;
  featureType: number;
  featureTypeName: string;
  layerFeatureType: number;
  parentFeatureType?: number;
  columns: AttributeListColumnModel[];
  showPassportColumnsOnly: boolean;
  rows: AttributeListRowModel[];
  attributeRelationKeys: string[];
  checkedFeatures: CheckedFeature[];
  filter: AttributeFilterModel[];
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
  statistics: AttributeListStatisticColumnModel[];
}

