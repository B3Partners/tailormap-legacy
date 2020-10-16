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
  Feature,
  FeatureControllerService,
} from '../../shared/generated';
import { VectorLayer } from '../../../../../bridge/typings';
import { SewageWorkflow } from '../workflows/SewageWorkflow';
import { Subject } from 'rxjs';
import { CopyWorkflow } from '../workflows/CopyWorkflow';

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
    private featureInitializerService: FeatureInitializerService) {
  }

  public getWorkflow(featureType?: string): Workflow {

    let workflow: Workflow = null;
    switch (featureType) {
      case 'wegvakonderdeel':
        workflow = new StandardFormWorkflow();
        break;
      case 'rioolput':
        workflow = new SewageWorkflow();
        break;
      case 'copyMode':
        workflow = new CopyWorkflow();
        break;
      default:
        workflow = new StandardFormWorkflow();
    }
    this.numWorkflows++;
    workflow.vectorLayer = this.vectorLayer;
    workflow.highlightLayer = this.highlightLayer;
    workflow.id = this.numWorkflows;
    workflow.init(this.tailorMap, this.dialog, this.featureInitializerService,
      this.formConfigRepo, this.snackBar, this.service, this.ngZone);

    return workflow;
  }
}
