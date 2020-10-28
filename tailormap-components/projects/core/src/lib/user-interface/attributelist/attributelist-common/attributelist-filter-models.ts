export interface LayerFilterValues {
  layerId: number;
  columns: FilterColumns[];
 }

export interface FilterColumns {
  name: string;
  status: boolean;
  nullValue: boolean;
  uniqueValues: FilterValueSettings[]
}

export interface UniqueValues {
  values: FilterValueSettings[];
}

export interface FilterValueSettings {
  // value in column.
  value: string;
  // value in filter selected
  select: boolean;
}
