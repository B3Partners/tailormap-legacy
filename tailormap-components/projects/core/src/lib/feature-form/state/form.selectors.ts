import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormState, formStateKey } from './form.state';
import { Feature } from '../../shared/generated';
import { selectFormConfigs } from '../../application/state/application.selectors';

const selectFormState = createFeatureSelector<FormState>(formStateKey);

export const selectFeatures = createSelector(selectFormState, state => state.features);

export const selectCurrentFeature = createSelector(selectFormState, state => state.feature);

export const selectFeatureFormEnabled = createSelector(selectFormState, state => state.formEnabled);

export const selectFormAlreadyDirty = createSelector(selectFormState, state => state.alreadyDirty);

export const selectCloseAfterSaveFeatureForm = createSelector(selectFormState, state => state.closeAfterSave);

export const selectIsMultiFormWorkflow = createSelector(selectFormState, state => state.multiFormWorkflow);

export const selectFormEditing = createSelector(selectFormState, state => state.editing);

export const selectFormVisible = createSelector(selectFormState, state => state.formVisible);

export const selectTreeVisible = createSelector(selectFormState, state => state.treeVisible);

export const selectFormConfigForFeature = createSelector(
  selectFormConfigs,
  selectCurrentFeature,
  (formConfigs, feature: Feature) => {
    return feature && formConfigs ? formConfigs.get(feature.tableName) : null;
  },
);

export const selectFeatureLabel = createSelector(
  selectFormConfigs,
  (formConfigs, feature: Feature): string => {
   return feature[formConfigs.get(feature.tableName)];
  },
);

export const selectCopyFormOpen = createSelector(selectFormState, state => state.copyFormOpen);
export const selectCopyFormOptionsOpen = createSelector(selectFormState, state => state.copyOptionsOpen);
export const selectParentCopyFeature = createSelector(selectFormState, state => state.copyFeature);
export const selectCurrentSelectedCopyFeature = createSelector(selectFormState, state => state.copySelectedFeature);
export const selectCopyDestinationFeatures = createSelector(selectFormState, state => state.copyDestinationFeatures);
