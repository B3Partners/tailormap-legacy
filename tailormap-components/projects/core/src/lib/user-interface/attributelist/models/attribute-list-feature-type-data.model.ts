import { AttributeListColumnModel } from './attribute-list-column-models';
import { AttributeListRowModel } from './attribute-list-row.model';
import { FilterColumns } from './attribute-list-filter-models';
import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';

export interface AttributeListFeatureTypeData {
  layerId: string;
  featureType: number;
  parentFeatureType?: number;
  columns: AttributeListColumnModel[];
  rows: AttributeListRowModel[];
  filter: FilterColumns[];
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
}

