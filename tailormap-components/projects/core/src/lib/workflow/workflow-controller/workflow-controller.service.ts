import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MapClickedEvent } from '../../shared/models/event-models';
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

  public workflowFinished() : void{
    this.init();
  }

  public addFeature(featureType: string): void {
    this.currentWorkflow = this.getWorkflow(featureType);

    this.currentWorkflow.addFeature(featureType);
  }

  public getWorkflow(featureType ?: string): Workflow {
    if (this.currentWorkflow) {
      this.currentWorkflow.destroy();
    }
    const wf = this.workflowFactory.getWorkflow(featureType);
    this.subscriptions.add(wf.close$.subscribe(value => this.init()));
    return wf;
  }

  public mapClicked(data: MapClickedEvent): void {
    this.currentWorkflow.mapClick(data);
  }
}
