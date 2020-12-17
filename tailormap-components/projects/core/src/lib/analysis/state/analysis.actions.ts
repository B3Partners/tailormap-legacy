import {
  createAction,
  props,
} from '@ngrx/store';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';

const analysisActionsPrefix = '[Analysis]';

export const setCreateLayerMode = createAction(
  `${analysisActionsPrefix} Set Layer Creation Mode`,
  props<{ createLayerMode: CreateLayerModeEnum }>(),
);

export const clearCreateLayerMode = createAction(
  `${analysisActionsPrefix} Clear Layer Creation Mode`,
);

export const setLayerName = createAction(
  `${analysisActionsPrefix} Set Layer Name`,
  props<{ layerName: string }>(),
);

export const selectDataSource = createAction(
  `${analysisActionsPrefix} Select Data Source`,
  props<{ selectDataSource: boolean }>(),
);

export const setSelectedDataSource = createAction(
  `${analysisActionsPrefix} Set Selected Data Source`,
  props<{ source: AnalysisSourceModel }>(),
);

export const showCriteriaForm = createAction(
  `${analysisActionsPrefix} Show Criteria Form`,
  props<{ criteriaMode?: CriteriaTypeEnum }>(),
);

export const createCriteria = createAction(
  `${analysisActionsPrefix} Create Criteria`,
  props<{ criteria: CriteriaModel }>(),
);

export const removeCriteria = createAction(
  `${analysisActionsPrefix} Remove Criteria`,
);

export const setCreatingLayer = createAction(`${analysisActionsPrefix} Creating Layer`);

export const setCreatingLayerSuccess = createAction(`${analysisActionsPrefix} Creating Layer Success`);

export const setCreatingLayerFailed = createAction(
  `${analysisActionsPrefix} Creating Layer Failed`,
  props<{ message: string }>(),
);
