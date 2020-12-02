import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  AnalysisState,
  analysisStateKey,
} from './analysis.state';
import { CreateLayerDataModel } from '../models/create-layer-data.model';

const selectAnalysisState = createFeatureSelector<AnalysisState>(analysisStateKey);

export const selectCreateLayerMode = createSelector(selectAnalysisState, state => state.createLayerMode);

export const selectSelectedDataSource = createSelector(selectAnalysisState, state => state.selectedDataSource);
