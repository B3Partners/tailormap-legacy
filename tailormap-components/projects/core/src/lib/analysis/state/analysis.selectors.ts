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

export const selectIsSelectingDataSource = createSelector(selectAnalysisState, state => state.selectDataSource);

export const selectSelectedDataSource = createSelector(selectAnalysisState, state => state.selectedDataSource);

export const selectIsCreatingCriteria = createSelector(selectAnalysisState, state => !!state.createCriteriaMode);

export const selectCreateCriteriaMode = createSelector(selectAnalysisState, state => state.createCriteriaMode);

export const selectCriteria = createSelector(selectAnalysisState, state => state.criteria);
