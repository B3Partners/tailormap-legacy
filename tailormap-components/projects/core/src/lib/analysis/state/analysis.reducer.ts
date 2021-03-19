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
import { PassportAttributeModel } from '../../application/models/passport-attribute.model';

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

const onSetSelectedThematicAttribute = (state: AnalysisState, payload: { attribute: PassportAttributeModel }): AnalysisState => ({
  ...state,
  selectedThematicAttribute: payload.attribute,
});

const onLoadStyles = (state: AnalysisState): AnalysisState => ({
  ...state,
  loadingStyles: true,
  loadStylesErrorMessage: '',
});

const onLoadStylesSuccess = (state: AnalysisState, payload: { styles: UserLayerStyleModel[] }): AnalysisState => ({
  ...state,
  loadingStyles: false,
  loadStylesErrorMessage: '',
  styles: payload.styles,
});

const onLoadStylesFailed = (state: AnalysisState, payload: { error: string }): AnalysisState => ({
  ...state,
  loadingStyles: false,
  loadStylesErrorMessage: payload.error,
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

const onUpdateAllStyles = (
  state: AnalysisState,
  payload: { styleProp: keyof UserLayerStyleModel; value: string | number | boolean },
): AnalysisState => ({
  ...state,
  styles: state.styles.map<UserLayerStyleModel>(s => ({
    ...s,
    [payload.styleProp]: payload.value,
  })),
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

const onCloseSidePanels = (state: AnalysisState): AnalysisState => ({
  ...state,
  selectDataSource: false,
  createCriteriaMode: null,
  selectedStyle: null,
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
  on(AnalysisActions.loadStyles, onLoadStyles),
  on(AnalysisActions.loadStylesSuccess, onLoadStylesSuccess),
  on(AnalysisActions.loadStylesFailed, onLoadStylesFailed),
  on(AnalysisActions.setSelectedStyle, onSetSelectedStyle),
  on(AnalysisActions.updateStyle, onUpdateStyle),
  on(AnalysisActions.updateAllStyles, onUpdateAllStyles),
  on(AnalysisActions.setCreatingLayer, onCreatingLayer),
  on(AnalysisActions.setCreatingLayerSuccess, onCreatingLayerSuccess),
  on(AnalysisActions.setCreatingLayerFailed, onCreatingLayerFailed),
  on(AnalysisActions.closeSidePanels, onCloseSidePanels),
);

export const analysisReducer = (state: AnalysisState | undefined, action: Action) => {
  return analysisReducerImpl(state, action);
};
