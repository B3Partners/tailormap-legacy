import { Feature } from '../../shared/generated';

export enum WORKFLOW_ACTION {
  ADD_FEATURE = 'add_feature',
  COPY = 'copy_feature',
  SPLIT_MERGE = 'split_merge',
}

export class WorkflowActionEvent {
  public feature?: Feature;
  public action : WORKFLOW_ACTION;
}
