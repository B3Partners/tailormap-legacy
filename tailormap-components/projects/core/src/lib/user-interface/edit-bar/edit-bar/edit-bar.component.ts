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

@Component({
  selector: 'tailormap-edit-bar',
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.css'],
})
export class EditBarComponent implements OnInit {

  public isEditting = false;
  private dialogRef: MatDialogRef<AddFeatureMenuComponent>;

  constructor(
    private tailorMapService: TailorMapService,
    private workflowManager: WorkflowActionManagerService,
    public dialog: MatDialog) {
  }

  public ngOnInit(): void {
  }

  public onEdit(): void {

    this.dialogRef = this.dialog.open(AddFeatureMenuComponent, {
      width: '400px',
      position: {
        top: '170px',
        left: '580px',
      },
      height: '77px',
      disableClose: true,
      hasBackdrop: false,
      panelClass: 'panelClass',

    });
    this.isEditting = true;
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    this.dialogRef.afterClosed().subscribe(result => {
      //  this.afterEditting(result);
      this.isEditting = false;
    });

    //  alert('not yet implemented');
  }

  public hasSplit(): boolean {
    const vc = this.tailorMapService.getViewerController();
    const comps = vc.getComponentsByClassNames(['viewer.components.Split']);
    return comps.length > 0 && !(comps[0] as SplitComponent).popup.isVisible();
  }

  public hasMerge(): boolean {
    const vc = this.tailorMapService.getViewerController();
    const comps = vc.getComponentsByClassNames(['viewer.components.Merge']);
    return comps.length > 0 && !(comps[0] as MergeComponent).popup.isVisible();
  }

  public onSplit(): void {
    this.workflowManager.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE});
    this.tailorMapService.openSplitComponent();
  }

  public onMerge(): void {
    this.workflowManager.setAction({action: WORKFLOW_ACTION.SPLIT_MERGE});
    this.tailorMapService.openMergeComponent();
  }
}
