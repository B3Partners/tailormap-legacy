import {
  Injectable,
  NgZone,
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
import { VectorLayer } from '../../../../../bridge/typings';

@Injectable({
  providedIn: 'root',
})
export class WorkflowControllerService implements OnDestroy {

  private currentWorkflow: Workflow;
  private subscriptions = new Subscription();

  constructor(
    private workflowFactory: WorkflowFactoryService,
    private ngZone: NgZone,
    private workflowActionManagerService: WorkflowActionManagerService,
  ) {
    this.workflowActionManagerService.actionChanged$.subscribe(value => {
      if (!value) {
        return;
      }
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
  }

  public workflowChanged(event: WorkflowActionEvent): void {
    this.currentWorkflow = this.getWorkflow(event);
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

  public geometryDrawn(vectorLayer: VectorLayer, feature: any) {
    this.ngZone.run(() => {
      this.currentWorkflow.geometryDrawn(vectorLayer, feature);
    });
  }
}
