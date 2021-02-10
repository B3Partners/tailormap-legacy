import { createAction, props } from '@ngrx/store';
import { AttributeListConfig } from '../models/attribute-list.config';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { LoadDataResult } from '../services/attribute-list-data.service';

const attributeListActionsPrefix = '[Attributelist]';

export const setAttributeListVisibility = createAction(
  `${attributeListActionsPrefix} Set AttributeList Visibility`,
  props<{ visible: boolean }>(),
);

export const setAttributeListConfig = createAction(
  `${attributeListActionsPrefix} Set AttributeList Configuration`,
  props<{ config: Partial<AttributeListConfig> }>(),
);

export const changeAttributeListTabs = createAction(
  `${attributeListActionsPrefix} Change AttributeList Tabs`,
  props<{ newTabs: AttributeListTabModel[], newFeatureData: AttributeListFeatureTypeData[], closedTabs: number[] }>(),
);

export const loadDataForTab = createAction(
  `${attributeListActionsPrefix} Load Data For Tab`,
  props<{ layerId: string }>(),
);

export const loadDataForTabSuccess = createAction(
  `${attributeListActionsPrefix} Load Data For Tab Success`,
  props<{ layerId: string, data: LoadDataResult }>(),
);

export const loadDataForFeatureTypeSuccess = createAction(
  `${attributeListActionsPrefix} Load Data For Feature Type Success`,
  props<{ featureType: number, data: LoadDataResult }>(),
);

export const setSelectedTab = createAction(
  `${attributeListActionsPrefix} Set Selected Tab`,
  props<{ layerId: string }>(),
);

export const updatePage = createAction(
  `${attributeListActionsPrefix} Update Page`,
  props<{ featureType: number, page: number }>(),
);

export const updateSort = createAction(
  `${attributeListActionsPrefix} Update Sort`,
  props<{ featureType: number, column: string, direction: 'asc' | 'desc' | '' }>(),
);

export const toggleCheckedAllRows = createAction(
  `${attributeListActionsPrefix} Toggle Checked All Rows`,
  props<{ featureType: number }>(),
);

export const updateRowChecked = createAction(
  `${attributeListActionsPrefix} Update Row Checked`,
  props<{ featureType: number, rowId: string, checked: boolean }>(),
);

export const updateRowExpanded = createAction(
  `${attributeListActionsPrefix} Update Row Expanded`,
  props<{ featureType: number, rowId: string, expanded: boolean }>(),
);

export const updateRowSelected = createAction(
  `${attributeListActionsPrefix} Update Row Selected`,
  props<{ layerId: string, featureType: number, rowId: string, selected: boolean }>(),
);
