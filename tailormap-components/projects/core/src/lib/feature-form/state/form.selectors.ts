import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormState, formStateKey } from './form.state';

const selectFormState = createFeatureSelector<FormState>(formStateKey);

export const selectOpenFeatureForm = createSelector(selectFormState, state => state.features);

export const selectFeatureFormOpen = createSelector(selectFormState, state => state.formOpen);

export const selectCloseAfterSaveFeatureForm = createSelector(selectFormState, state => state.closeAfterSave);
