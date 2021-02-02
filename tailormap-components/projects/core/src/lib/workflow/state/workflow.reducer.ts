import { Action, createReducer, on } from '@ngrx/store';
import { initialWorkflowState, WorkflowAction, WorkflowState } from './workflow.state';
import * as WorkflowActions from './workflow.actions';

const onSetAction = (state: WorkflowState, payload : { action: WorkflowAction }): WorkflowState => ({
  ...state,
  action: payload.action,
});

const workflowReducerImpl = createReducer(
  initialWorkflowState,
  on(WorkflowActions.setAction, onSetAction),
);

export const workflowReducer = (state: WorkflowState | undefined, action: Action) => {
  return workflowReducerImpl(state, action);
}
