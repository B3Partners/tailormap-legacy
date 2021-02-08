import { createAction, props } from '@ngrx/store';
import { WORKFLOW_ACTION } from './workflow-models';
import { Feature } from '../../shared/generated';


const formActionsPrefix = '[Workflow]';

export let setAction = createAction(
  `${formActionsPrefix} Set current action`,
  props<{ action : WORKFLOW_ACTION }>(),
);

export let setFeature = createAction(
  `${formActionsPrefix} Set workflow feature`,
  props<{ feature : Feature, action : WORKFLOW_ACTION }>(),
);


export let setTypes = createAction(
  `${formActionsPrefix} Set workflow types`,
  props<{ featureType : string, geometryType: string, action : WORKFLOW_ACTION }>(),
);
