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
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';
import { CriteriaModel } from '../models/criteria.model';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { Attribute } from '../../shared/attribute-service/attribute-models';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';

const clearAnalysisState = (state: AnalysisState): AnalysisState => ({
  ...state,
  createLayerMode: null,
  layerName: '',
  selectDataSource: false,
  selectedDataSource: null,
  createCriteriaMode: null,
  criteria: null,
  styles: null,
  isCreatingLayer: false,
  createLayerErrorMessage: '',
  createdAppLayer: '',
});

const onSetCreateLayerMode = (state: AnalysisState, payload: { createLayerMode: CreateLayerModeEnum }): AnalysisState => ({
  ...state,
  createLayerMode: payload.createLayerMode,
});

const onClearCreateLayerMode = (state: AnalysisState): AnalysisState => clearAnalysisState(state);

const onSetLayerName = (state: AnalysisState, payload: { layerName: string }): AnalysisState => ({
  ...state,
  layerName: payload.layerName,
});

const onSelectDataSource = (state: AnalysisState, payload: { selectDataSource: boolean }): AnalysisState => ({
  ...state,
  selectDataSource: payload.selectDataSource,
});

const onSetSelectedDataSource = (state: AnalysisState, payload: { source: AnalysisSourceModel }): AnalysisState => ({
  ...state,
  selectedDataSource: payload.source,
  selectDataSource: false,
});

const onShowCriteriaForm = (state: AnalysisState, payload: { criteriaMode?: CriteriaTypeEnum }): AnalysisState => ({
  ...state,
  createCriteriaMode: payload.criteriaMode,
});

const onCreateCriteria = (state: AnalysisState, payload: { criteria: CriteriaModel }): AnalysisState => ({
  ...state,
  criteria: payload.criteria,
  createCriteriaMode: null,
});

const onRemoveCriteria = (state: AnalysisState): AnalysisState => ({
  ...state,
  criteria: null,
  createCriteriaMode: null,
});

const onSetSelectedThematicAttribute = (state: AnalysisState, payload: { attribute: Attribute }): AnalysisState => ({
  ...state,
  selectedThematicAttribute: payload.attribute,
});

const onLoadThematicStyles = (state: AnalysisState): AnalysisState => ({
  ...state,
  loadingThematicStyles: true,
  loadThematicStylesErrorMessage: '',
});

const onLoadThematicStylesSuccess = (state: AnalysisState, payload: { styles: ScopedUserLayerStyleModel[] }): AnalysisState => ({
  ...state,
  loadingThematicStyles: false,
  loadThematicStylesErrorMessage: '',
  styles: payload.styles,
});

const onLoadThematicStylesFailed = (state: AnalysisState, payload: { error: string }): AnalysisState => ({
  ...state,
  loadingThematicStyles: false,
  loadThematicStylesErrorMessage: payload.error,
});


const onSetStyles = (state: AnalysisState, payload: { styles: UserLayerStyleModel[] }): AnalysisState => ({
  ...state,
  styles: payload.styles,
});

const onSetSelectedStyle = (state: AnalysisState, payload: { styleId: string }): AnalysisState => ({
  ...state,
  selectedStyle: payload.styleId,
});

const onUpdateStyle = (state: AnalysisState, payload: { style: UserLayerStyleModel }): AnalysisState => {
  const idx = state.styles.findIndex(s => s.id === payload.style.id);
  if (idx === -1) {
    return state;
  }
  return {
    ...state,
    styles: [
      ...state.styles.slice(0, idx),
      payload.style,
      ...state.styles.slice(idx + 1),
    ],
  };
};

const onCreatingLayer = (state: AnalysisState): AnalysisState => ({
  ...state,
  isCreatingLayer: true,
});

const onCreatingLayerSuccess = (state: AnalysisState, payload: { createdAppLayer: string }): AnalysisState => ({
  ...state,
  createdAppLayer: payload.createdAppLayer,
});

const onCreatingLayerFailed = (state: AnalysisState, payload: { message: string }): AnalysisState => ({
  ...state,
  isCreatingLayer: false,
  createLayerErrorMessage: payload.message,
});

const analysisReducerImpl = createReducer(
  initialAnalysisState,
  on(AnalysisActions.setCreateLayerMode, onSetCreateLayerMode),
  on(AnalysisActions.clearCreateLayerMode, onClearCreateLayerMode),
  on(AnalysisActions.setLayerName, onSetLayerName),
  on(AnalysisActions.selectDataSource, onSelectDataSource),
  on(AnalysisActions.setSelectedDataSource, onSetSelectedDataSource),
  on(AnalysisActions.showCriteriaForm, onShowCriteriaForm),
  on(AnalysisActions.createCriteria, onCreateCriteria),
  on(AnalysisActions.removeCriteria, onRemoveCriteria),
  on(AnalysisActions.setSelectedThematicAttribute, onSetSelectedThematicAttribute),
  on(AnalysisActions.loadThematicStyles, onLoadThematicStyles),
  on(AnalysisActions.loadThematicStylesSuccess, onLoadThematicStylesSuccess),
  on(AnalysisActions.loadThematicStylesFailed, onLoadThematicStylesFailed),
  on(AnalysisActions.setStyles, onSetStyles),
  on(AnalysisActions.setSelectedStyle, onSetSelectedStyle),
  on(AnalysisActions.updateStyle, onUpdateStyle),
  on(AnalysisActions.setCreatingLayer, onCreatingLayer),
  on(AnalysisActions.setCreatingLayerSuccess, onCreatingLayerSuccess),
  on(AnalysisActions.setCreatingLayerFailed, onCreatingLayerFailed),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
}
