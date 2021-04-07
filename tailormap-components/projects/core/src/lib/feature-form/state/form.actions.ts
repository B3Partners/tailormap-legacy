import { createAction, props } from '@ngrx/store';
import { Feature } from '../../shared/generated';
import { SelectedCopyAttribute } from './form.state';

const formActionsPrefix = '[Form]';

export const setTreeOpen = createAction(
  `${formActionsPrefix} Open form tree`,
  props<{ treeOpen: boolean }>(),
);

export const setOpenFeatureForm = createAction(
  `${formActionsPrefix} Open feature form`,
  props<{ features: Feature[]; closeAfterSave?: boolean; alreadyDirty?: boolean; editMode?: boolean; multiFormWorkflow?: boolean }>(),
);

export const setSetFeatures = createAction(
  `${formActionsPrefix} Save features`,
  props<{ features: Feature[] }>(),
);

export const setCloseFeatureForm = createAction(
  `${formActionsPrefix} Close feature form`,
);

export const toggleFeatureFormVisibility = createAction(
  `${formActionsPrefix} Toggle Feature Form Visibility`,
  props<{ visible: boolean }>(),
);

export const setFeature = createAction(
  `${formActionsPrefix} Set feature`,
  props<{ feature: Feature }>(),
);

export const setNewFeature = createAction(
  `${formActionsPrefix} Add new feature as child of current feature`,
  props<{ newFeature: Feature; parentId: string }>(),
);

export const setFeatureRemoved = createAction(
  `${formActionsPrefix} Removed feature`,
  props<{ feature: Feature }>(),
);

export const setFormEditing = createAction(
  `${formActionsPrefix} Set form editing`,
  props<{ editing: boolean }>(),
);

export const openCopyForm = createAction(
  `${formActionsPrefix} Open Copy Feature Form`,
  props<{ feature: Feature }>(),
);

export const setCopySelectedFeature = createAction(
  `${formActionsPrefix} Set Copy Selected Feature`,
  props<{ feature: string }>(),
);

export const toggleCopyDestinationFeature = createAction(
  `${formActionsPrefix} Toggle Copy Destination Feature`,
  props<{ destinationFeature: Feature }>(),
);

export const toggleSelectedAttribute = createAction(
  `${formActionsPrefix} Toggle Copy Destination Feature`,
  props<{ attribute: SelectedCopyAttribute }>(),
);

export const closeCopyForm = createAction(
  `${formActionsPrefix} Close Copy Feature Form`,
);

export const setCopyOptionsOpen = createAction(
  `${formActionsPrefix} Set Copy Options Panel Open`,
  props<{ open: boolean }>(),
);
