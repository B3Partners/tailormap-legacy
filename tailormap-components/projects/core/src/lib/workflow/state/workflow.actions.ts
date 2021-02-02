import { createAction, props } from '@ngrx/store';
import { WorkflowAction } from './workflow.state';

const formActionsPrefix = '[Workflow]';

export let setAction = createAction(
  `${formActionsPrefix} Set current action`,
  props<{ action : WorkflowAction }>(),
);
