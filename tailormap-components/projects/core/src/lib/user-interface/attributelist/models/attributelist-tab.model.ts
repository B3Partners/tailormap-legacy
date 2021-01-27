import { AttributelistColumn } from './attributelist-column-models';
import { RowData } from '../attributelist-common/attributelist-models';

export interface AttributelistTabModel {
  label: string;
  columns: AttributelistColumn[];
  rows: RowData[]
  pageSize: number;
  pageIndex: number;
  sortedColumn?: string;
  sortDirection: 'ASC' | 'DESC';
}
