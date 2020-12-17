import {
  Component,
  OnInit,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AddFeatureMenuComponent } from '../add-feature-menu/add-feature-menu.component';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { WorkflowActionManagerService } from '../../../workflow/workflow-controller/workflow-action-manager.service';
import { WORKFLOW_ACTION } from '../../../workflow/workflow-controller/workflow-models';
import {
  MergeComponent,
  SplitComponent,
} from '../../../../../../bridge/typings';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';

@Component({
  selector: 'tailormap-edit-bar',
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.css'],
})
export class EditBarComponent implements OnInit {

  public isEditting = false;
  private dialogRef: MatDialogRef<AddFeatureMenuComponent>;

  private mergeComponent: MergeComponent;
  private splitComponent: SplitComponent;

  constructor(
    private tailorMapService: TailorMapService,
    private workflowService: WorkflowControllerService,
    private workflowManager: WorkflowActionManagerService,
    public dialog: MatDialog) {
  }

  public ngOnInit(): void {
    const vc = this.tailorMapService.getViewerController();
    const splits = vc.getComponentsByClassNames(['viewer.components.Split']);
    if (splits.length > 0) {
      this.splitComponent = splits[0] as SplitComponent;
      this.splitComponent.addListener('ON_DEACTIVATE', this.deactivateSplitMerge, this);
    }

    const merges = vc.getComponentsByClassNames(['viewer.components.Merge']);
    if (merges.length > 0) {
      this.mergeComponent = merges[0] as MergeComponent;
      this.mergeComponent.addListener('ON_DEACTIVATE', this.deactivateSplitMerge, this);
    }
  }

  public deactivateSplitMerge(): void {
    this.workflowService.workflowFinished();
  }

  public onEdit(): void {
    this.dialogRef = this.dialog.open(AddFeatureMenuComponent, {
      width: '400px',
      position: {
        top: '100px',
        left: '160px',
      },
      height: '77px',
      disableClose: true,
      hasBackdrop: false,
      panelClass: 'panelClass',

    });
    this.isEditting = true;
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    this.dialogRef.afterClosed().subscribe(result => {
      this.isEditting = false;
    });

  }

  public hasSplit(): boolean {
    return this.splitComponent != null && !this.splitComponent.popup.isVisible();
  }

  public hasMerge(): boolean {
    return this.mergeComponent != null && !this.mergeComponent.popup.isVisible();
  }

  public onSplit(): void {
    this.workflowManager.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE});
    this.splitComponent.showWindow();
  }

  public onMerge(): void {
    this.workflowManager.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE});
    this.mergeComponent.showWindow();
  }

}
