import {
  Component,
  NgZone,
} from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import {
  LayerUtils,
} from '../../shared/layer-utils/layer-utils.service';
import { WorkflowControllerService } from '../../workflow/workflow-controller/workflow-controller.service';

@Component({
  selector: 'tailormap-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css'],
})
export class AddFeatureComponent {

  constructor(
    public tailorMapService: TailorMapService,
    private formConfigRepo: FormconfigRepositoryService,
    private workflowControllerService: WorkflowControllerService,
    private ngZone: NgZone,
  ) {
    this.tailorMapService.layerVisibilityChanged$.subscribe(value => {
      this.ngZone.run(() => {
        this.calculateVisibleLayers();
      });
    });
    this.init();
  }

  public visibleLayers: string[] = [];

  public init(): void {
    if (this.formConfigRepo.isLoaded()) {
      this.calculateVisibleLayers();
    } else {
      setTimeout(function () {
        this.init()
      }.bind(this), 500);
    }
  }

  public click(featuretype) {
    this.workflowControllerService.addFeature(featuretype);
  }

  public calculateVisibleLayers(): void {
    this.visibleLayers = [];
    const allowFts = this.formConfigRepo.getFeatureTypes();

    const appLayers = this.tailorMapService.getViewerController().getVisibleLayers() as number[];
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
