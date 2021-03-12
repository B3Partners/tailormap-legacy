import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { addFeatureToParent, removeFeature, updateFeatureInArray } from './form.state-helpers';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

const onCloseFeatureForm  = (state: FormState): FormState => ({
  ...state,
  features: [],
  feature: null,
  formOpen: false,
  treeOpen: false,
});

const onSetHideFeatureForm = (state: FormState, payload: ReturnType<typeof FormActions.toggleFeatureFormVisibility>): FormState => ({
  ...state,
  formOpen: payload.visible,
  treeOpen: payload.visible,
});

const onSetFeature = (state: FormState, payload: ReturnType<typeof FormActions.setFeature>): FormState => ({
  ...state,
  feature: payload.feature,
});

const onSetNewFeature = (state: FormState, payload: ReturnType<typeof FormActions.setNewFeature>): FormState => {
  const idx = state.features.findIndex(feature => feature.objectGuid === payload.parentId);
  if (idx === -1) {
    return state;
  }
  let features = [...state.features];
  if (payload.newFeature.objectGuid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT) {
    features = updateFeatureInArray(features, payload.newFeature);
  }else {
    features = addFeatureToParent(features, payload.newFeature, payload.parentId);
  }
  return {
    ...state,
    features,
    feature: payload.newFeature,
    editing: false,
  };
};

const onSetFeatures = (state: FormState, payload:  ReturnType<typeof FormActions.setSetFeatures>): FormState => ({
  ...state,
  features: payload.features,
});

const onSetOpenFeatureForm = (state: FormState, payload:  ReturnType<typeof FormActions.setOpenFeatureForm>): FormState => ({
  ...state,
  features: payload.features,
  formOpen: true,
  treeOpen: true,
  closeAfterSave: payload.closeAfterSave || false,
  alreadyDirty: payload.alreadyDirty || false,
  editing: false,
});

const onSetTreeOpen = (state: FormState, payload:  ReturnType<typeof FormActions.setTreeOpen>): FormState => ({
  ...state,
  treeOpen: payload.treeOpen,
});

const onSetFormEditing = (state: FormState, payload:  ReturnType<typeof FormActions.setFormEditing>): FormState => ({
  ...state,
  editing: payload.editing,
});

const onSetFeatureRemoved = (state: FormState, payload:  ReturnType<typeof FormActions.setFeatureRemoved>): FormState => {
  const features =  removeFeature([...state.features], payload.feature);
  return {
    ...state,
    features,
    feature: features.length > 0 ? features[0] : null,
    formOpen: features.length > 0,
    treeOpen: features.length > 0,
  };
};

const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setTreeOpen, onSetTreeOpen),
  on(FormActions.setFormEditing, onSetFormEditing),
  on(FormActions.setSetFeatures, onSetFeatures),
  on(FormActions.setFeature, onSetFeature),
  on(FormActions.setFeatureRemoved, onSetFeatureRemoved),
  on(FormActions.setNewFeature, onSetNewFeature),
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
  on(FormActions.setCloseFeatureForm, onCloseFeatureForm),
  on(FormActions.toggleFeatureFormVisibility, onSetHideFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
};
