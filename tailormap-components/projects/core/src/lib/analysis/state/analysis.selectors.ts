import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalysisState, analysisStateKey } from './analysis.state';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';

const selectAnalysisState = createFeatureSelector<AnalysisState>(analysisStateKey);

export const selectCreateLayerMode = createSelector(selectAnalysisState, state => state.createLayerMode);

export const selectIsSelectingDataSource = createSelector(selectAnalysisState, state => !!state.selectDataSource);

export const selectLayerName = createSelector(selectAnalysisState, state => state.layerName);

export const selectSelectedDataSource = createSelector(selectAnalysisState, state => state.selectedDataSource);

export const selectIsCreatingCriteria = createSelector(selectAnalysisState, state => !!state.createCriteriaMode);

export const selectCreateCriteriaMode = createSelector(selectAnalysisState, state => state.createCriteriaMode);

export const selectCriteria = createSelector(selectAnalysisState, state => state.criteria);

export const selectSelectedThematicAttribute = createSelector(selectAnalysisState, state => state.selectedThematicAttribute);

export const selectIsCreatingLayer = createSelector(selectAnalysisState, state => state.isCreatingLayer);

export const selectCreateLayerErrorMessage = createSelector(selectAnalysisState, state => state.createLayerErrorMessage);

export const selectCreatedAppLayer = createSelector(selectAnalysisState, state => state.createdAppLayer);

export const selectStyles = createSelector(selectAnalysisState, state => state.styles);

export const selectSelectedStyle = createSelector(selectAnalysisState, state => state.selectedStyle);

export const selectSelectedStyleModel = createSelector(
  selectStyles,
  selectSelectedStyle,
  (styles, selectedStyle) => {
    if (!selectedStyle || !styles || styles.length === 0) {
      return null;
    }
    return styles.find(s => s.id === selectedStyle);
  },
);

export const selectCanCreateAttributesLayer = createSelector(
  selectCriteria,
  selectCreateLayerMode,
  (criteria, createLayerMode) => {
    if (createLayerMode !== CreateLayerModeEnum.ATTRIBUTES) {
      return true;
    }
    return !!criteria && CriteriaHelper.validGroups(criteria.groups);
  },
);

export const selectCanCreateThematicLayer = createSelector(
  selectSelectedThematicAttribute,
  selectCreateLayerMode,
  (attribute, createLayerMode) => {
    if (createLayerMode !== CreateLayerModeEnum.THEMATIC) {
      return true;
    }
    return !!attribute;
  },
);

export const selectCanCreateLayer = createSelector(
  selectSelectedDataSource,
  selectLayerName,
  selectIsCreatingLayer,
  selectCanCreateAttributesLayer,
  selectCanCreateThematicLayer,
  (selectedDataSource, layerName, isCreatingLayer, canCreateAttributesLayer, canCreateThematicLayer) => {
    return !isCreatingLayer
      && !!selectedDataSource
      && !!layerName
      && canCreateAttributesLayer
      && canCreateThematicLayer;
  },
);

export const selectCreateLayerData = createSelector(
  selectCreateLayerMode,
  selectSelectedDataSource,
  selectCriteria,
  selectLayerName,
  selectStyles,
  selectCanCreateLayer,
  selectCreatedAppLayer,
  (createLayerMode, selectedDataSource, criteria, layerName, styles, canCreateLayer, createdAppLayer) => {
    return {
      createLayerMode,
      selectedDataSource,
      criteria,
      layerName,
      styles,
      canCreateLayer,
      createdAppLayer,
    };
  },
);
