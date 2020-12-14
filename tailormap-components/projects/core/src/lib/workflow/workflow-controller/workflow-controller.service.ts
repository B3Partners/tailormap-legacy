import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { Subscription } from 'rxjs';
import { WorkflowActionManagerService } from './workflow-action-manager.service';
import {
  WORKFLOW_ACTION,
  WorkflowActionEvent,
} from './workflow-models';

@Injectable({
  providedIn: 'root',
})
export class WorkflowControllerService implements OnDestroy {

  private currentWorkflow: Workflow;
  private subscriptions = new Subscription();

  constructor(
    private workflowFactory: WorkflowFactoryService,
    private workflowActionManagerService: WorkflowActionManagerService,
  ) {
    this.workflowActionManagerService.actionChanged$.subscribe(value => {
      this.workflowChanged(value);
    })
  }

  public init(): void {
    this.currentWorkflow = this.getWorkflow();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public workflowFinished(): void {
    this.init();
  }

  public addFeature(featureType: string, geometryType ?: string): void {
    this.currentWorkflow = this.getWorkflow(featureType);

    this.currentWorkflow.addFeature(featureType, geometryType);
  }

  public workflowChanged(event: WorkflowActionEvent): void {
    switch (event.action) {
      case WORKFLOW_ACTION.COPY:
        this.setCopyMode(event.feature);
        break;
      case WORKFLOW_ACTION.ADD_FEATURE:
        break;
      case WORKFLOW_ACTION.SPLIT_MERGE:
        this.currentWorkflow = this.getWorkflow(WORKFLOW_ACTION.SPLIT_MERGE);
        break;
    }
  }

  public setCopyMode(feature: Feature): void {
    this.currentWorkflow = this.getWorkflow(WORKFLOW_ACTION.COPY);

    this.currentWorkflow.setFeature(feature);
  }

  public getWorkflow(featureType ?: string): Workflow {
    if (this.currentWorkflow) {
      this.currentWorkflow.destroy();
    }
    const wf = this.workflowFactory.getWorkflow(featureType);
    this.subscriptions.add(wf.close$.subscribe(value => this.init()));
    return wf;
  }

  public getDestinationFeatures(): Feature[] {
    return this.currentWorkflow.getDestinationFeatures();
  }

  public mapClicked(data: MapClickedEvent): void {
    this.currentWorkflow.mapClick(data);
  }
}
