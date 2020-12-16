import {
  Injectable,
  NgZone,
} from '@angular/core';
import { Workflow } from '../workflows/Workflow';
import { StandardFormWorkflow } from '../workflows/StandardFormWorkflow';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import {
  FeatureControllerService,
} from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { SewageWorkflow } from '../workflows/SewageWorkflow';
import { CopyWorkflow } from '../workflows/CopyWorkflow';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import {
  WORKFLOW_ACTION,
  WorkflowActionEvent,
} from '../workflow-controller/workflow-models';
import { NoOpWorkflow } from '../workflows/NoOpWorkflow';
import { EditgeometryWorkflow } from '../workflows/EditgeometryWorkflow';

@Injectable({
  providedIn: 'root',
})
export class WorkflowFactoryService {

  public vectorLayer: VectorLayer;
  public numWorkflows = 0;
  public highlightLayer: VectorLayer;

  constructor(
    private tailorMap: TailorMapService,
    private dialog: MatDialog,
    private formConfigRepo: FormconfigRepositoryService,
    private snackBar: MatSnackBar,
    private service: FeatureControllerService,
    private ngZone: NgZone,
    private confirmService: ConfirmDialogService,
    private featureInitializerService: FeatureInitializerService) {
  }

  public getWorkflow(event: WorkflowActionEvent): Workflow {

    let workflow: Workflow = null;
    switch (event.action) {

      case WORKFLOW_ACTION.ADD_FEATURE:
        switch (event.featureType) {
          case 'mechleiding':
          case 'vrijvleiding':
            workflow = new SewageWorkflow();
            break;
          default:
            workflow = new StandardFormWorkflow();
        }
        break;
      case WORKFLOW_ACTION.COPY:
        workflow = new CopyWorkflow();
        break;
      case WORKFLOW_ACTION.SPLIT_MERGE:
        workflow = new NoOpWorkflow();
        break;
      case WORKFLOW_ACTION.EDIT_GEOMTRY:
        workflow = new EditgeometryWorkflow();
        break;
      case WORKFLOW_ACTION.DEFAULT:
        workflow = new StandardFormWorkflow();
        break;
      default:
        workflow = new StandardFormWorkflow();

    }
    this.numWorkflows++;
    workflow.vectorLayer = this.vectorLayer;
    workflow.highlightLayer = this.highlightLayer;
    workflow.id = this.numWorkflows;
    workflow.init(event, this.tailorMap, this.dialog, this.featureInitializerService,
      this.formConfigRepo, this.snackBar, this.service, this.ngZone, this.confirmService);

    return workflow;
  }
}
