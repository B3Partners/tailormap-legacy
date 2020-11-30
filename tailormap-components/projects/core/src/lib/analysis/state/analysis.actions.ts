import {
  createAction,
  props,
} from '@ngrx/store';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AppLayer } from '../../../../../bridge/typings';

const analysisActionsPrefix = '[Analysis]';

export const setCreateLayerMode = createAction(
  `${analysisActionsPrefix} Set Layer Creation Mode`,
  props<{ createLayerMode: CreateLayerModeEnum }>(),
);

export const clearCreateLayerMode = createAction(
  `${analysisActionsPrefix} Clear Layer Creation Mode`,
);

export const setSelectedDataSource = createAction(
  `${analysisActionsPrefix} Set Selected Data Source`,
  props<{ layer: AppLayer }>(),
)
