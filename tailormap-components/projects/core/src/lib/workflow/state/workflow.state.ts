import { WORKFLOW_ACTION } from './workflow-models';

export const workflowStateKey = 'workflow';

export interface WorkflowState {
  action: WORKFLOW_ACTION;
}

export const initialWorkflowState: WorkflowState = {
  action: WORKFLOW_ACTION.DEFAULT,
}

// deze verder uitwerken
