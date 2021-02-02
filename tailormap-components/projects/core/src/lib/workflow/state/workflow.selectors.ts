import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkflowState, workflowStateKey } from './workflow.state';

const selectWorkflowState = createFeatureSelector<WorkflowState>(workflowStateKey);

export const selectAction = createSelector( selectWorkflowState, state => state.action);
