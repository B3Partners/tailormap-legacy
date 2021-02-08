import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkflowState, workflowStateKey } from './workflow.state';

const selectWorkflowState = createFeatureSelector<WorkflowState>(workflowStateKey);

export const selectAction = createSelector( selectWorkflowState, state => state.action);

export const selectFeature = createSelector( selectWorkflowState, state => state.feature);

export const selectFeatureType = createSelector( selectWorkflowState, state => state.featureType);

export const selectGeometryType = createSelector( selectWorkflowState, state => state.geometryType);

