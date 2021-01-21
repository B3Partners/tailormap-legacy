import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalysisState, analysisStateKey } from './analysis.state';
import { CriteriaHelper } from '../criteria/helpers/criteria.helper';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { PassportAttributeModel } from '../../application/models/passport-attribute.model';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaModel } from '../models/criteria.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { CreateLayerDataModel } from '../models/create-layer-data.model';

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

export const selectLoadingStyles = createSelector(selectAnalysisState, state => state.loadingStyles);

export const selectStyleErrorMessage = createSelector(selectAnalysisState, state => state.loadStylesErrorMessage);

export const selectStyles = createSelector(selectAnalysisState, state => state.styles);

export const selectSelectedStyle = createSelector(selectAnalysisState, state => state.selectedStyle);

export const selectStylesSortedByFeatureCount = createSelector(
  selectStyles,
  styles => {
    if (!styles) {
      return [];
    }
    return [...styles].sort((s1, s2) => {
      const featureCount1 = s1.featureCount || 0;
      const featureCount2 = s2.featureCount || 0;
      return featureCount1 === featureCount2 ? 0 : (featureCount1 > featureCount2) ? -1 : 1;
    });
  },
);

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
  selectSelectedThematicAttribute,
  selectLayerName,
  selectStyles,
  selectCanCreateLayer,
  selectCreatedAppLayer,
  (
    createLayerMode: CreateLayerModeEnum,
    selectedDataSource: AnalysisSourceModel,
    criteria: CriteriaModel,
    thematicAttribute: PassportAttributeModel,
    layerName: string,
    styles: UserLayerStyleModel[],
    canCreateLayer: boolean,
    createdAppLayer: string,
  ): CreateLayerDataModel => {
    return {
      createLayerMode,
      selectedDataSource,
      criteria,
      thematicAttribute,
      layerName,
      styles,
      canCreateLayer,
      createdAppLayer,
    };
  },
);
