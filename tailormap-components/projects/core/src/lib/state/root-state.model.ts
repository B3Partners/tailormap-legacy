import { AnalysisState, analysisStateKey, initialAnalysisState } from '../analysis/state/analysis.state';
import { ApplicationState, applicationStateKey, initialApplicationState } from '../application/state/application.state';
import { FormState, formStateKey, initialFormState } from '../feature-form/state/form.state';

export interface RootStateModel {
  [analysisStateKey]: AnalysisState;
  [applicationStateKey]: ApplicationState;
  [formStateKey]: FormState;
}

export const defaultRootState: RootStateModel = {
  [analysisStateKey]: initialAnalysisState,
  [applicationStateKey]: initialApplicationState,
  [formStateKey]: initialFormState,
};
