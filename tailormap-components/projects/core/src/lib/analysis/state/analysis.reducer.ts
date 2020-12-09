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

const onSetCreateLayerMode = (state: AnalysisState, payload: { createLayerMode: CreateLayerModeEnum }): AnalysisState => ({
  ...state,
  createLayerMode: payload.createLayerMode,
});

const onClearCreateLayerMode = (state: AnalysisState): AnalysisState => ({
  ...state,
  createLayerMode: null,
  selectDataSource: false,
  selectedDataSource: null,
  createCriteriaMode: null,
  criteria: null,
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

const analysisReducerImpl = createReducer(
  initialAnalysisState,
  on(AnalysisActions.setCreateLayerMode, onSetCreateLayerMode),
  on(AnalysisActions.clearCreateLayerMode, onClearCreateLayerMode),
  on(AnalysisActions.selectDataSource, onSelectDataSource),
  on(AnalysisActions.setSelectedDataSource, onSetSelectedDataSource),
  on(AnalysisActions.showCriteriaForm, onShowCriteriaForm),
  on(AnalysisActions.createCriteria, onCreateCriteria),
  on(AnalysisActions.removeCriteria, onRemoveCriteria),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
}
