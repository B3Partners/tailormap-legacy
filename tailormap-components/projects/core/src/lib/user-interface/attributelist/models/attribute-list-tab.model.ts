import { AttributeListColumnModel } from './attribute-list-column-models';
import { RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { AttributeListFilterModel } from './attribute-list-filter.model';
import { AttributeListRowModel } from './attribute-list-row.model';

export interface AttributeListTabModel {
  layerId: string;
  layerAlias: string;
  layerName: string;
  loadingData: boolean;
  loadingError?: string;
  columns: AttributeListColumnModel[];
  relatedFeatures: RelatedFeatureType[];
  // leftSideRelations: string[];
  // rightSideRelations: string[];
  filter: AttributeListFilterModel[];
  rows: AttributeListRowModel[];
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
}
