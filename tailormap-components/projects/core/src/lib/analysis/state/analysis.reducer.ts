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

const onSetSelectedAssignmentType = (state: AnalysisState, payload: { createLayerMode: CreateLayerModeEnum }): AnalysisState => ({
  ...state,
  createLayerMode: payload.createLayerMode,
})


const assignmentsReducerImpl = createReducer(
  initialAnalysisState,
  on(AnalysisActions.setSelectedAssignmentType, onSetSelectedAssignmentType),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return assignmentsReducerImpl(state, action);
}
