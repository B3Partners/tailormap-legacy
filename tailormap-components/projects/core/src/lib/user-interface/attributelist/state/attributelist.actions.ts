import { createAction, props } from '@ngrx/store';
import { AttributelistConfig } from '../models/attributelist.config';
import { AttributelistTabModel } from '../models/attributelist-tab.model';

const attributelistActionsPrefix = '[Attributelist]';

export const setAttributelistVisibility = createAction(
  `${attributelistActionsPrefix} Set Attributelist Visibility`,
  props<{ visible: boolean }>(),
);

export const toggleAttributelistVisibility = createAction(
  `${attributelistActionsPrefix} Toggle Attributelist Visibility`,
);

export const setAttributelistConfig = createAction(
  `${attributelistActionsPrefix} Set Attributelist Configuration`,
  props<{ config: Partial<AttributelistConfig> }>(),
);

export const addAttributelistTab = createAction(
  `${attributelistActionsPrefix} Set Attributelist Configuration`,
  props<{ tab: AttributelistTabModel }>(),
);
