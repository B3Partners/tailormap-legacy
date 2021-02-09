import { createAction, props } from '@ngrx/store';
import { Feature } from '../../shared/generated';
import { FormConfiguration } from '../form/form-models';
import { FormAction } from './form.state';

const formActionsPrefix = '[Form]';

export let setTreeOpen = createAction(
  `${formActionsPrefix} Open form tree`,
  props<{ treeOpen : boolean }>(),
);

export let setFormAction = createAction(
  `${formActionsPrefix} Set form action`,
  props<{ action : FormAction }>(),
);

export const setOpenFeatureForm = createAction(
  `${formActionsPrefix} Open feature form`,
  props<{ features : Feature[], closeAfterSave ?: boolean, alreadyDirty?: boolean }>(),
);

export const setSaveFeatures = createAction(
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

export const setFormConfigs = createAction(
  `${formActionsPrefix} Set formconfigurations`,
  props<{ formConfigs : Map<string, FormConfiguration> }>(),
);
