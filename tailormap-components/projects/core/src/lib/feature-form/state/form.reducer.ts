import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { addFeatureToParent, updateFeatureInArray } from './form.state-helpers';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';

const onCloseFeatureForm  = (state: FormState): FormState => ({
  ...state,
  features: [],
  feature: null,
  formOpen: false,
  treeOpen: false,
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
  let features = [...state.features];
  if(payload.newFeature.objectGuid !== FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT){
    features = updateFeatureInArray(features, payload.newFeature);
  }else{
    features = addFeatureToParent(features, payload.newFeature, payload.parentId);
  }
  return {
    ...state,
    features,
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
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
