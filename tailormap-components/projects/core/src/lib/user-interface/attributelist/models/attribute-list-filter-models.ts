import { CriteriaConditionModel } from '../../../analysis/models/criteria-condition.model';

export interface LayerFilterValues {
  layerId: number;
  columns: FilterColumns[];
}

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

export interface AttributeListUniqueFilterValueSettings {
  // value in column.
  value: string;
  // value in filter selected
  select: boolean;
}

export interface FilterColumns {
  name: string;
  status: boolean;
  nullValue: boolean;
  filterType: string;
  uniqueValues: FilterValueSettings[];
  criteria: CriteriaConditionModel;
}

export interface FilterValueSettings {
  // value in column.
  value: string;
  // value in filter selected
  select: boolean;
}

export interface FilterDialogSettings {
  filterType: string;
  filterSetting: string;
  criteria: CriteriaConditionModel;
}
