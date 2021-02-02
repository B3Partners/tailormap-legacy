export enum WorkflowAction {
  IDLE = 'idle',
  SAVED = 'saved',
}

export const workflowStateKey = 'workflow';

export interface WorkflowState {
  action: WorkflowAction;
}

export const initialWorkflowState: WorkflowState = {
  action: WorkflowAction.IDLE,
}
