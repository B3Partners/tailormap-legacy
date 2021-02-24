import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';

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

const onSetFeature = (state: FormState, payload : ReturnType<typeof FormActions.setFeature>): FormState => ({
  ...state,
  feature: payload.feature,
});

const onSetNewFeature = (state: FormState, payload: ReturnType<typeof FormActions.setNewFeature>): FormState => {
  const idx = state.features.findIndex(feature => feature.objectGuid === payload.parentId);
  if (idx === -1) {
    return state;
  }

  return {
    ...state,
    features: [
      ...state.features.slice(0, idx),
      {
        ...state.features[idx],
        children: [...state.features[idx].children, payload.newFeature],
      },
      ...state.features.slice(idx + 1),
    ],
    feature: payload.newFeature,
    editting: false,
  };
};

const onSetFeatures = (state: FormState, payload:  ReturnType<typeof FormActions.setSetFeatures>) : FormState => ({
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
  editting: false,
});

const onSetTreeOpen = (state: FormState, payload :  ReturnType<typeof FormActions.setTreeOpen>): FormState => ({
  ...state,
  treeOpen: payload.treeOpen,
});

const onSetFormEditting = (state: FormState, payload :  ReturnType<typeof FormActions.setFormEditting>): FormState => ({
  ...state,
  editting: payload.editting,
});

const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setTreeOpen, onSetTreeOpen),
  on(FormActions.setFormEditting, onSetFormEditting),
  on(FormActions.setSetFeatures, onSetFeatures),
  on(FormActions.setFeature, onSetFeature),
  on(FormActions.setNewFeature, onSetNewFeature),
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
  on(FormActions.setCloseFeatureForm, onCloseFeatureForm),
  on(FormActions.toggleFeatureFormVisibility, onSetHideFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
