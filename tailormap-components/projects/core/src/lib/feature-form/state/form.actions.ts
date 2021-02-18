import { createAction, props } from '@ngrx/store';
import { Feature } from '../../shared/generated';

const formActionsPrefix = '[Form]';

export let setTreeOpen = createAction(
  `${formActionsPrefix} Open form tree`,
  props<{ treeOpen : boolean }>(),
);

export const setOpenFeatureForm = createAction(
  `${formActionsPrefix} Open feature form`,
  props<{ features : Feature[], closeAfterSave ?: boolean, alreadyDirty?: boolean }>(),
);

export const setSetFeatures = createAction(
  `${formActionsPrefix} Save features`,
  props<{ features : Feature[] }>(),
);

export const setCloseFeatureForm = createAction(
  `${formActionsPrefix} Close feature form`,
);

export const setFeature = createAction(
  `${formActionsPrefix} Set feature`,
  props<{ feature : Feature }>(),
);

export const setNewFeature = createAction(
  `${formActionsPrefix} Add new feature as child of current feature`,
  props<{ feature : Feature }>(),
);

export const setFormEditting = createAction(
  `${formActionsPrefix} Set form editting`,
  props<{ editting: boolean }>(),
);
