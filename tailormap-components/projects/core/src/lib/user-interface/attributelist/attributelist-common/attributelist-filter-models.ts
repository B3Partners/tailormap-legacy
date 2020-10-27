export interface LayerFilterValues {
  layerId: number;
  columns: FilterColumns[];
 }

export interface FilterColumns {
  key: string;
  status: boolean;
  uniqueValues: FilterValueSettings[]
}

export interface UniqueValues {
  value: FilterValueSettings[];
}
export interface FilterValueSettings {
  // value in column.
  key: string;
  // use value in filter select
  select: boolean;
}
