import { createAction, props } from '@ngrx/store';
import { AttributeListConfig } from '../models/attribute-list.config';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { RowData } from '../attributelist-common/attributelist-models';

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
  props<{ newTabs: AttributeListTabModel[], closedTabs: string[] }>(),
);

export const loadDataForTab = createAction(
  `${attributeListActionsPrefix} Load Data For Tab`,
  props<{ layerId: string }>(),
);

export const loadDataForTabSuccess = createAction(
  `${attributeListActionsPrefix} Load Data For Tab Success`,
  props<{ layerId: string, tabChanges: Partial<AttributeListTabModel> }>(),
)

export const setSelectedTab = createAction(
  `${attributeListActionsPrefix} Set Selected Tab`,
  props<{ layerId: string }>(),
);

export const clearFilterForLayer = createAction(
  `${attributeListActionsPrefix} Clear Filter For Layer`,
  props<{ layerId: string }>(),
);

export const clearAllFilters = createAction(
  `${attributeListActionsPrefix} Clear All Filters`,
  props<{ layerId: string }>(),
);

export const updatePage = createAction(
  `${attributeListActionsPrefix} Update Page`,
  props<{ layerId: string, page: number }>(),
);

export const updateSort = createAction(
  `${attributeListActionsPrefix} Update Sort`,
  props<{ layerId: string, column: string, direction: 'asc' | 'desc' | '' }>(),
);

export const toggleCheckedAllRows = createAction(
  `${attributeListActionsPrefix} Toggle Checked All Rows`,
  props<{ layerId: string }>(),
);

export const updateRowChecked = createAction(
  `${attributeListActionsPrefix} Update Row Checked`,
  props<{ layerId: string, rowId: string, checked: boolean }>(),
);

export const updateRowExpanded = createAction(
  `${attributeListActionsPrefix} Update Row Expanded`,
  props<{ layerId: string, rowId: string, expanded: boolean }>(),
);

export const updateRowSelected = createAction(
  `${attributeListActionsPrefix} Update Row Selected`,
  props<{ layerId: string, rowId: string, selected: boolean }>(),
);
