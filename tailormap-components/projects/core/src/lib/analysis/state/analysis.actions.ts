import {
  createAction,
  props,
} from '@ngrx/store';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';

const analysisActionsPrefix = '[Analysis]';

export const setCreateLayerMode = createAction(
  `${analysisActionsPrefix} Set Layer Creation Mode`,
  props<{ createLayerMode: CreateLayerModeEnum }>(),
);

export const clearCreateLayerMode = createAction(
  `${analysisActionsPrefix} Clear Layer Creation Mode`,
);
