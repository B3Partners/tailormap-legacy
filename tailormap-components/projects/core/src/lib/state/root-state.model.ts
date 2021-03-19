import { AnalysisState, analysisStateKey, initialAnalysisState } from '../analysis/state/analysis.state';
import { ApplicationState, applicationStateKey, initialApplicationState } from '../application/state/application.state';
import { FormState, formStateKey, initialFormState } from '../feature-form/state/form.state';
import {
  AttributeListState, attributeListStateKey, initialAttributeListState,
} from '../user-interface/attributelist/state/attribute-list.state';

export interface RootStateModel {
  [analysisStateKey]: AnalysisState;
  [applicationStateKey]: ApplicationState;
  [formStateKey]: FormState;
  [attributeListStateKey]: AttributeListState;
}

export const defaultRootState: RootStateModel = {
  [analysisStateKey]: initialAnalysisState,
  [applicationStateKey]: initialApplicationState,
  [formStateKey]: initialFormState,
  [attributeListStateKey]: initialAttributeListState,
};
