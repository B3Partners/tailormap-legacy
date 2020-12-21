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

const clearAnalysisState = (state: AnalysisState): AnalysisState => ({
  ...state,
  createLayerMode: null,
  layerName: '',
  selectDataSource: false,
  selectedDataSource: null,
  createCriteriaMode: null,
  criteria: null,
  style: null,
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

const onSetStyle = (state: AnalysisState, payload: { style: UserLayerStyleModel }): AnalysisState => ({
  ...state,
  style: payload.style,
});

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
  on(AnalysisActions.setStyle, onSetStyle),
  on(AnalysisActions.setCreatingLayer, onCreatingLayer),
  on(AnalysisActions.setCreatingLayerSuccess, onCreatingLayerSuccess),
  on(AnalysisActions.setCreatingLayerFailed, onCreatingLayerFailed),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
}
