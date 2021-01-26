import { createAction, props } from '@ngrx/store';
import { Feature } from '../../shared/generated';

const formActionsPrefix = '[Form]';

export const setOpenFeatureForm = createAction(
  `${formActionsPrefix} Open feature form`,
  props<{ features : Feature[], closeAfterSave ?: boolean, alreadyDirty?: boolean }>(),
);
export const setCloseFeatureForm = createAction(
  `${formActionsPrefix} Close feature form`,
);

export const setSavedFeature = createAction(
  `${formActionsPrefix} Feature saved`,
  props<{ feature : Feature }>(),
);
