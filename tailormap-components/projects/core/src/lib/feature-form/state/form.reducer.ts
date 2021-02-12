import { Action, createReducer, on } from '@ngrx/store';
import { FormAction, FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { Feature } from '../../shared/generated';
import { FormConfiguration } from '../form/form-models';

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

const onSaveFeature = (state: FormState, payload:  ReturnType<typeof FormActions.setSaveFeatures>) : FormState => ({
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
});

const onSetTreeOpen = (state: FormState, payload :  ReturnType<typeof FormActions.setTreeOpen>): FormState => ({
  ...state,
  treeOpen: payload.treeOpen,
});

const onSetFormConfigs = (state: FormState, payload : ReturnType<typeof FormActions.setFormConfigs>): FormState => ({
  ...state,
  formConfigs: payload.formConfigs,
});

const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setFormConfigs, onSetFormConfigs),
  on(FormActions.setTreeOpen, onSetTreeOpen),
  on(FormActions.setSaveFeatures, onSaveFeature),
  on(FormActions.setFeature, onSetFeature),
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
  on(FormActions.setCloseFeatureForm, onCloseFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
