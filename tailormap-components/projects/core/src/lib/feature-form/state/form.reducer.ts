import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { Feature } from '../../shared/generated';

const onCloseFeatureForm  = (state: FormState): FormState => ({
  ...state,
  features: [],
  formOpen: false,
});

const onSetOpenFeatureForm = (state: FormState, payload: { features?: Feature[], closeAfterSave?: boolean }): FormState => ({
  ...state,
  features: payload.features,
  formOpen: true,
  closeAfterSave: payload.closeAfterSave || false,
});


const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
  on(FormActions.setCloseFeatureForm, onCloseFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
