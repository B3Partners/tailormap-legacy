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

export const selectCreateLayerData = createSelector(selectAnalysisState, (state): CreateLayerDataModel => ({
  selectedDataSource: state.selectedDataSource,
}))
