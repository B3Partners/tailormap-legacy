import {
  AnalysisState,
  initialAnalysisState,
} from './analysis.state';
import {
  Action,
  createReducer,
  on,
} from '@ngrx/store';
import * as AnalysisActions from './analysis.actions';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { CriteriaSourceModel } from '../models/criteria-source.model';

const onSetCreateLayerMode = (state: AnalysisState, payload: { createLayerMode: CreateLayerModeEnum }): AnalysisState => ({
  ...state,
  createLayerMode: payload.createLayerMode,
});

const onClearCreateLayerMode = (state: AnalysisState): AnalysisState => ({
  ...state,
  createLayerMode: null,
});

const onSetSelectedDataSource = (state: AnalysisState, payload: { source: CriteriaSourceModel }): AnalysisState => ({
  ...state,
  selectedDataSource: payload.source,
});

const analysisReducerImpl = createReducer(
  initialAnalysisState,
  on(AnalysisActions.setCreateLayerMode, onSetCreateLayerMode),
  on(AnalysisActions.clearCreateLayerMode, onClearCreateLayerMode),
  on(AnalysisActions.setSelectedDataSource, onSetSelectedDataSource),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
}
