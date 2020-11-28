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

const onSetCreateLayerMode = (state: AnalysisState, payload: { createLayerMode: CreateLayerModeEnum }): AnalysisState => ({
  ...state,
  createLayerMode: payload.createLayerMode,
});

const onClearCreateLayerMode = (state: AnalysisState): AnalysisState => ({
  ...state,
  createLayerMode: null,
});

const analysisReducerImpl = createReducer(
  initialAnalysisState,
  on(AnalysisActions.setCreateLayerMode, onSetCreateLayerMode),
  on(AnalysisActions.clearCreateLayerMode, onClearCreateLayerMode),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
}
