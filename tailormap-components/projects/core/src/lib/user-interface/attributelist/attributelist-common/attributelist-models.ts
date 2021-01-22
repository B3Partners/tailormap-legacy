import { AttributelistColumnController } from './attributelist-column-controller';
import { AttributelistConfig } from '../models/attributelist.config';

export interface AttributelistTable {
  onAfterLoadData: () => void;
}

export interface AttributelistForFilter {
  columnController: AttributelistColumnController;
  refreshTable: () => void;
}

// Array of properties of type any.
export interface RowData {
  [property: string]: any;
}

export interface RowClickData {
  feature: RowData;
  layerId: number;
}
