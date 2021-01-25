import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnalysisState, analysisStateKey } from '../../analysis/state/analysis.state';
import { FormState, formStateKey } from './form.state';

const selectFormState = createFeatureSelector<FormState>(formStateKey);

export const selectOpenFeatureForm = createSelector(selectFormState, state => state.features);
