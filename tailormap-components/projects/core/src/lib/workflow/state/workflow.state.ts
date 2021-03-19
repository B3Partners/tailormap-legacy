import { WORKFLOW_ACTION } from './workflow-models';
import { Feature } from '../../shared/generated';

export const workflowStateKey = 'workflow';

export interface WorkflowState {
  action: WORKFLOW_ACTION;
  featureType: string;
  geometryType: string;
  feature: Feature;
}

export const initialWorkflowState: WorkflowState = {
  action: null,
  featureType: null,
  geometryType: null,
  feature: null,
};

// deze verder uitwerken
