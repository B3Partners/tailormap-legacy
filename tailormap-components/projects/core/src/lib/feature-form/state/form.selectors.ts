import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormState, formStateKey } from './form.state';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { Feature } from '../../shared/generated';
import { selectFormConfigs } from '../../application/state/application.selectors';

const selectFormState = createFeatureSelector<FormState>(formStateKey);

export const selectFeatures = createSelector(selectFormState, state => state.features);

export const selectCurrentFeature = createSelector(selectFormState, state => state.feature);

export const selectFeatureFormOpen = createSelector(selectFormState, state => state.formOpen);

export const selectFormAlreadyDirty = createSelector(selectFormState, state => state.alreadyDirty);

export const selectCloseAfterSaveFeatureForm = createSelector(selectFormState, state => state.closeAfterSave);

export const selectIsMultiFormWorkflow = createSelector(selectFormState, state => state.multiFormWorkflow);

export const selectFormEditing = createSelector(selectFormState, state => state.editing);

export const selectTreeOpen = createSelector(selectFormState, state => state.treeOpen);

export const selectFormConfigForFeature = createSelector(
  selectFormConfigs,
  selectCurrentFeature,
  (formConfigs, feature: Feature) => {
    return feature && formConfigs ? formConfigs.get(LayerUtils.sanitizeLayername(feature.objecttype)) : null;
  },
);

export const selectFeatureLabel = createSelector(
  selectFormConfigs,
  (formConfigs, feature: Feature): string => {
   return feature[formConfigs.get(LayerUtils.sanitizeLayername(feature.clazz))];
  },
);

export const selectCopyFormOpen = createSelector(selectFormState, state => state.copyFormOpen);
export const selectCopyFormOptionsOpen = createSelector(selectFormState, state => state.copyOptionsOpen);
export const selectCurrentCopyFeature = createSelector(selectFormState, state => state.copyFeature);
export const selectCopyDestinationFeatures = createSelector(selectFormState, state => state.copyDestinationFeatures);
