import { AnalysisState, initialAnalysisState } from '../../analysis/state/analysis.state';
import { Action, createReducer, on } from '@ngrx/store';
import { FormState, initialFormState } from './form.state';
import * as FormActions from './form.actions';
import { Feature } from '../../shared/generated';


const onSetOpenFeatureForm = (state: FormState, payload: { features?: Feature[] }): FormState => ({
  ...state,
  features: payload.features,
});


const formReducerImpl = createReducer(
  initialFormState,
  on(FormActions.setOpenFeatureForm, onSetOpenFeatureForm),
);

export const formReducer = (state: FormState | undefined, action: Action) => {
  return formReducerImpl(state, action);
}
