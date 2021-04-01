import { Action, createReducer, on } from '@ngrx/store';
import { initialWorkflowState,  WorkflowState } from './workflow.state';
import * as WorkflowActions from './workflow.actions';
import { WORKFLOW_ACTION } from './workflow-models';
import { Feature } from '../../shared/generated';

const onSetAction = (state: WorkflowState, payload: { action: WORKFLOW_ACTION }): WorkflowState => ({
  ...state,
  action: payload.action,
});

const onSetFeature = (state: WorkflowState, payload: { feature: Feature; action: WORKFLOW_ACTION }): WorkflowState => ({
  ...state,
  feature: payload.feature,
  action: payload.action,
});

const onSetTypes = (state: WorkflowState, payload: {
  featureType: string;
  geometryType: string;
  action: WORKFLOW_ACTION;
}): WorkflowState => ({
  ...state,
  featureType: payload.featureType,
  geometryType: payload.geometryType,
  action: payload.action,
});

const onUpdateConfig = (state: WorkflowState, payload: ReturnType<typeof WorkflowActions.updateConfig>): WorkflowState => ({
  ...state,
  config: {
    ...state.config,
    ...payload.config,
  },
});

const workflowReducerImpl = createReducer(
  initialWorkflowState,
  on(WorkflowActions.setTypes, onSetTypes),
  on(WorkflowActions.setFeature, onSetFeature),
  on(WorkflowActions.setAction, onSetAction),
  on(WorkflowActions.updateConfig, onUpdateConfig),
);

export const workflowReducer = (state: WorkflowState | undefined, action: Action) => {
  return workflowReducerImpl(state, action);
};
