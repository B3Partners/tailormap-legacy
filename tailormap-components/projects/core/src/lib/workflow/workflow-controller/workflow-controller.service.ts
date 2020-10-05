import { Injectable } from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MapClickedEvent } from '../../shared/models/event-models';

@Injectable({
  providedIn: 'root',
})
export class WorkflowControllerService {

  private currentWorkflow: Workflow;

  constructor(
    private workflowFactory: WorkflowFactoryService,
  ) {
  }

  public init(): void {
    this.currentWorkflow = this.getWorkflow();
  }

  public addFeature(featureType: string): void {
    this.currentWorkflow = this.getWorkflow(featureType);

    this.currentWorkflow.addFeature(featureType);
  }

  public getWorkflow(featureType ?: string): Workflow {
    if (this.currentWorkflow) {
      this.currentWorkflow.destroy();
    }
    return this.workflowFactory.getWorkflow(featureType);
  }

  public mapClicked(data: MapClickedEvent): void {
    this.currentWorkflow.mapClick(data);
  }
}
