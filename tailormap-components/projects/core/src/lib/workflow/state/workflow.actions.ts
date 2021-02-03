import { createAction, props } from '@ngrx/store';
import { WORKFLOW_ACTION } from './workflow-models';


const formActionsPrefix = '[Workflow]';

export let setAction = createAction(
  `${formActionsPrefix} Set current action`,
  props<{ action : WORKFLOW_ACTION }>(),
);
