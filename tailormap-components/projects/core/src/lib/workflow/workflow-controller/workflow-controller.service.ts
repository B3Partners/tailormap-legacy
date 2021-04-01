import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { combineLatest, Subject } from 'rxjs';
import { VectorLayer } from '../../../../../bridge/typings';
import { WORKFLOW_ACTION } from '../state/workflow-models';
import { WorkflowState } from '../state/workflow.state';
import { Store } from '@ngrx/store';
import { selectAction, selectFeatureType } from '../state/workflow.selectors';
import { takeUntil } from 'rxjs/operators';
import * as WorkflowActions from '../state/workflow.actions';

@Injectable({
  providedIn: 'root',
})
export class WorkflowControllerService implements OnDestroy {

  private currentWorkflow: Workflow;
  private destroyed = new Subject();

  constructor(
    private workflowFactory: WorkflowFactoryService,
    private store$: Store<WorkflowState>,
    private ngZone: NgZone,
  ) {

    combineLatest([
      this.store$.select(selectAction),
      this.store$.select(selectFeatureType),
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([ action, featureType ]) => {
        if (action) {
          this.workflowChanged(action, featureType);
        }
      });

  }

  public init(): void {
    this.store$.dispatch(WorkflowActions.setAction({action: WORKFLOW_ACTION.DEFAULT}));
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public workflowFinished(): void {
    this.init();
  }

  public workflowChanged(action: WORKFLOW_ACTION, featureType: string): void {
    this.currentWorkflow = this.getWorkflow(action, featureType);
  }

  public getWorkflow(event: WORKFLOW_ACTION, featureType: string): Workflow {
    if (this.currentWorkflow) {
      this.currentWorkflow.destroy();
    }
    const wf = this.workflowFactory.getWorkflow(event, featureType);
    wf.close$.pipe(takeUntil(this.destroyed)).subscribe(() => this.init());
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
