export enum FilterType {
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT_LIKE',
  UNIQUE_VALUES = 'UNIQUE_VALUES',
}

export interface AttributeListFilterModel {
  name: string;
  value: string[];
  type: FilterType;
}
