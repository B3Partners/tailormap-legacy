import { AnalysisState, analysisStateKey, initialAnalysisState } from '../analysis/state/analysis.state';
import { ApplicationState, applicationStateKey, initialApplicationState } from '../application/state/application.state';

export interface RootStateModel {
  [analysisStateKey]: AnalysisState;
  [applicationStateKey]: ApplicationState;
}

export const defaultRootState: RootStateModel = {
  [analysisStateKey]: initialAnalysisState,
  [applicationStateKey]: initialApplicationState,
};
