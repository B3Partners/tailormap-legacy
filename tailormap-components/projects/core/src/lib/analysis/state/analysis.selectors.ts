import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  AnalysisState,
  analysisStateKey,
} from './analysis.state';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';

const selectAnalysisState = createFeatureSelector<AnalysisState>(analysisStateKey);

export const selectCreateLayerMode = createSelector(selectAnalysisState, state => state.createLayerMode);

export const selectIsSelectingDataSource = createSelector(selectAnalysisState, state => !!state.selectDataSource);

export const selectLayerName = createSelector(selectAnalysisState, state => state.layerName);

export const selectSelectedDataSource = createSelector(selectAnalysisState, state => state.selectedDataSource);

export const selectIsCreatingCriteria = createSelector(selectAnalysisState, state => !!state.createCriteriaMode);

export const selectCreateCriteriaMode = createSelector(selectAnalysisState, state => state.createCriteriaMode);

export const selectCriteria = createSelector(selectAnalysisState, state => state.criteria);

export const selectIsCreatingLayer = createSelector(selectAnalysisState, state => state.isCreatingLayer);

export const selectCreateLayerErrorMessage = createSelector(selectAnalysisState, state => state.createLayerErrorMessage);

export const selectCreatedAppLayer = createSelector(selectAnalysisState, state => state.createdAppLayer);

export const selectStyle = createSelector(selectAnalysisState, state => state.style);

export const selectCanCreateLayer = createSelector(
  selectSelectedDataSource,
  selectCriteria,
  selectLayerName,
  selectIsCreatingLayer,
  (selectedDataSource, criteria, layerName, isCreatingLayer) => {
    return !isCreatingLayer
      && !!selectedDataSource
      && !!criteria
      && !!layerName
      && CriteriaHelper.validGroups(criteria.groups);
  },
);

export const selectCreateLayerData = createSelector(
  selectSelectedDataSource,
  selectCriteria,
  selectLayerName,
  selectStyle,
  selectCanCreateLayer,
  selectCreatedAppLayer,
  (selectedDataSource, criteria, layerName, style, canCreateLayer, createdAppLayer) => {
    return {
      selectedDataSource,
      criteria,
      layerName,
      style,
      canCreateLayer,
      createdAppLayer,
    };
  },
);
