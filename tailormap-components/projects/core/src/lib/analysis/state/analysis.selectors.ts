import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  AnalysisState,
  analysisStateKey,
} from './analysis.state';

const selectAnalysisState = createFeatureSelector<AnalysisState>(analysisStateKey);

export const selectCreateLayerMode = createSelector(selectAnalysisState, state => state.createLayerMode);
