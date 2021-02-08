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

const onSetFeature = (state: FormState, payload : { feature: Feature }): FormState => ({
  ...state,
  feature: payload.feature,
});

const onSaveFeature = (state: FormState, payload: { features: Feature[] }) : FormState => ({
  ...state,
  features: payload.features,
});

const onSetOpenFeatureForm = (state: FormState, payload: { features?: Feature[], closeAfterSave?: boolean,
                                                           alreadyDirty?: boolean }): FormState => ({
  ...state,
  features: payload.features,
  formOpen: true,
  treeOpen: true,
  closeAfterSave: payload.closeAfterSave || false,
  alreadyDirty: payload.alreadyDirty || false,
});

const onSetTreeOpen = (state: FormState, payload : { treeOpen: boolean }): FormState => ({
  ...state,
  treeOpen: payload.treeOpen,
});

const onSetFormConfigs = (state: FormState, payload : { formConfigs: Map<string, FormConfiguration> }): FormState => ({
  ...state,
  formConfigs: payload.formConfigs,
});

const onSetAction = (state: FormState, payload : { action: FormAction }): FormState => ({
  ...state,
  action: payload.action,
});

const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setFormAction, onSetAction),
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
