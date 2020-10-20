
export interface AttributelistTable {
  onAfterLoadData: () => void;
}

export interface AttributelistConfig {
  pageSize: number;
}

// Array of properties of type any.
export interface RowData {
  [property: string]: any;
}

export interface RowClickData {
  feature: RowData;
  layerId: number;
}

