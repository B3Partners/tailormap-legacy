import { Feature } from '../../shared/generated';

export enum WORKFLOW_ACTION {
  ADD_FEATURE = 'add_feature',
  COPY = 'copy_feature',
  SPLIT_MERGE = 'split_merge',
  EDIT_GEOMETRY = 'edit_geometry',
  DEFAULT = 'standard',
}

export class WorkflowActionEvent {
  public feature?: Feature;
  public geometryType? : string;
  public featureType? : string;
  public action : WORKFLOW_ACTION;
}
