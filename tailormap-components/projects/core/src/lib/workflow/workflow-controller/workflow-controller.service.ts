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
    this.currentWorkflow = this.getWorkflow({action: WORKFLOW_ACTION.DEFAULT});
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public workflowFinished(): void {
    this.init();
  }/*

  public addFeature(event: WorkflowActionEvent, featureType: string, geometryType ?: string): void {
    this.currentWorkflow = this.getWorkflow(event, featureType);

    this.currentWorkflow.addFeature(featureType, geometryType);
  }*/

  public workflowChanged(event: WorkflowActionEvent): void {
    this.currentWorkflow = this.getWorkflow(event,);
    switch (event.action) {
      case WORKFLOW_ACTION.COPY:
        this.setCopyMode(event.feature);
        break;
      case WORKFLOW_ACTION.ADD_FEATURE:
        this.currentWorkflow.addFeature(event.featureType, event.geometryType);
        break;
    }
  }

  public setCopyMode(feature: Feature): void {
    this.currentWorkflow.setFeature(feature);
  }

  public getWorkflow(event: WorkflowActionEvent): Workflow {
    if (this.currentWorkflow) {
      this.currentWorkflow.destroy();
    }
    const wf = this.workflowFactory.getWorkflow(event);
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
