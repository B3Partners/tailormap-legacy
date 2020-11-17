import {
  Component,
  OnDestroy,
} from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import {
  LayerUtils,
} from '../../shared/layer-utils/layer-utils.service';
import { WorkflowControllerService } from '../../workflow/workflow-controller/workflow-controller.service';
import {
  combineLatest,
  Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tailormap-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css'],
})
export class AddFeatureComponent implements OnDestroy {

  private destroyed = new Subject()

  constructor(
    private tailorMapService: TailorMapService,
    private formConfigRepo: FormconfigRepositoryService,
    private workflowControllerService: WorkflowControllerService,
  ) {
    combineLatest([
      this.tailorMapService.layerVisibilityChanged$,
      this.formConfigRepo.formConfigs$,
    ]).pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.calculateVisibleLayers();
    });
  }

  public visibleLayers: string[] = [];

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public click(featuretype) {
    this.workflowControllerService.addFeature(featuretype);
  }

  public calculateVisibleLayers(): void {
    this.visibleLayers = [];
    const allowFts = this.formConfigRepo.getFeatureTypes();

    const appLayers = this.tailorMapService.getViewerController().getVisibleLayers();
    appLayers.forEach(appLayerId => {
      const appLayer = this.tailorMapService.getViewerController().getAppLayerById(appLayerId);
      let layerName: string = appLayer.layerName;
      layerName = LayerUtils.sanitzeLayername(layerName);

      if (allowFts.findIndex(l => l.toLowerCase() === layerName) !== -1) {
        this.visibleLayers.push(layerName);
      }
    });
  }

}
