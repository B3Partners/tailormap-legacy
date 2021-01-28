import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { Feature } from '../../shared/generated';
import { FormConfiguration, FormConfigurations } from '../form/form-models';

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

const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setFormConfigs, onSetFormConfigs),
  on(FormActions.setTreeOpen, onSetTreeOpen),
  on(FormActions.setFeature, onSetFeature),
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
  on(FormActions.setCloseFeatureForm, onCloseFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
