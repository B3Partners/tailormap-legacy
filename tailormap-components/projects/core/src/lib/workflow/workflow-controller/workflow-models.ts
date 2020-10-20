import { Feature } from '../../shared/generated';

export enum WORKFLOW_ACTION {
  ADD_FEATURE = 'add_feature',
  COPY = 'copy_feature',
}

export class WorkflowActionEvent {
  public feature: Feature;
  public action : WORKFLOW_ACTION;
}
