import { Feature } from '../../shared/generated';
import { WORKFLOW_ACTION } from '../state/workflow-models';


export class WorkflowActionEvent {
  public feature?: Feature;
  public geometryType? : string;
  public featureType? : string;
  public action : WORKFLOW_ACTION;
}
