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
  props<{ newTabs: AttributeListTabModel[], removedTabs: string[] }>(),
);

export const setSelectedTab = createAction(
  `${attributeListActionsPrefix} Set Selected Tab`,
  props<{ layerId: string }>(),
);

export const addAttributelistTabData = createAction(
  `${attributeListActionsPrefix} Add Attributelist Tab Data`,
  props<{ layerId: string, rows: RowData[] }>(),
);

export const replaceAttributelistTabData = createAction(
  `${attributeListActionsPrefix} Replace Attributelist Tab Data`,
  props<{ layerId: string, rows: RowData[] }>(),
);

export const clearFilterForLayer = createAction(
  `${attributeListActionsPrefix} Clear Filter For Layer`,
  props<{ layerId: string }>(),
);

export const clearAllFilters = createAction(
  `${attributeListActionsPrefix} Clear All Filters`,
  props<{ layerId: string }>(),
);
