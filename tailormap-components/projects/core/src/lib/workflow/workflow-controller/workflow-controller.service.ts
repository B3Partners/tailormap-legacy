import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Subject } from 'rxjs';
import { Feature } from '../../shared/generated';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowControllerService implements OnDestroy{

  private currentWorkflow: Workflow;
  private subscriptions = new Subscription();

  constructor(
    private workflowFactory: WorkflowFactoryService,
  ) {
  }

  public init(): void {
    this.currentWorkflow = this.getWorkflow();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public workflowFinished() : void {
    this.init();
  }

  public addFeature(featureType: string): void {
    this.currentWorkflow = this.getWorkflow(featureType);

    this.currentWorkflow.addFeature(featureType);
  }

  public setCopyMode(feature: Feature): void {
    this.currentWorkflow = this.getWorkflow('copyMode');

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

  public getDestinationFeatures(): Feature[]{
    return this.currentWorkflow.getDestinationFeatures();
  }

  public mapClicked(data: MapClickedEvent): void {
    this.currentWorkflow.mapClick(data);
  }
}
