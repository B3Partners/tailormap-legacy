import { Component, OnInit } from '@angular/core';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { MergeComponent, SplitComponent } from '../../../../../../bridge/typings';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';
import { Store } from '@ngrx/store';
import { FormState } from '../../../feature-form/state/form.state';
import { WORKFLOW_ACTION } from '../../../workflow/state/workflow-models';
import { WorkflowState } from '../../../workflow/state/workflow.state';
import * as WorkflowActions from '../../../workflow/state/workflow.actions';

@Component({
  selector: 'tailormap-edit-bar',
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.css'],
})
export class EditBarComponent implements OnInit {

  public isEditing = false;

  private mergeComponent: MergeComponent;
  private splitComponent: SplitComponent;

  constructor(
    private tailorMapService: TailorMapService,
    private workflowService: WorkflowControllerService,
    protected store$: Store<FormState | WorkflowState>) {
  }

  public ngOnInit(): void {
    const vc = this.tailorMapService.getViewerController();
    const splits = vc.getComponentsByClassNames(['viewer.components.Split']);
    if (splits.length > 0) {
      this.splitComponent = splits[0] as SplitComponent;
      this.splitComponent.addListener('ON_DEACTIVATE', () => this.deactivateSplitMerge());
    }

    const merges = vc.getComponentsByClassNames(['viewer.components.Merge']);
    if (merges.length > 0) {
      this.mergeComponent = merges[0] as MergeComponent;
      this.mergeComponent.addListener('ON_DEACTIVATE', () => this.deactivateSplitMerge());
    }
  }

  public deactivateSplitMerge(): void {
    this.workflowService.workflowFinished();
  }

  public onEdit(): void {
    this.isEditing = true;
  }

  public onEditClose() {
    this.isEditing = false;
  }

  public hasSplit(): boolean {
    return this.splitComponent != null && !this.splitComponent.popup.isVisible();
  }

  public hasMerge(): boolean {
    return this.mergeComponent != null && !this.mergeComponent.popup.isVisible();
  }

  public onSplit(): void {
    this.store$.dispatch(WorkflowActions.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE}));
    this.splitComponent.showWindow();
  }

  public onMerge(): void {
    this.store$.dispatch(WorkflowActions.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE}));
    this.mergeComponent.showWindow();
  }

}
