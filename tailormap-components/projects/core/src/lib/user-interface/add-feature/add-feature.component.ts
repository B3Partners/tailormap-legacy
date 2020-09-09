import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { AddButtonEvent } from './add-feature-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';

@Component({
  selector: 'tailormap-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css'],
})
export class AddFeatureComponent {

  constructor  (
      public tailorMapService: TailorMapService,
      private formConfigRepo: FormconfigRepositoryService,
  ) {
    this.tailorMapService.layerVisibilityChanged$.subscribe(value => {
      this.calculateVisibleLayers();
    });
    this.init();
  }

  @Output()
  public addFeature = new EventEmitter<AddButtonEvent>();

  public visibleLayers : string[] = [];

  public init(): void {
    if (this.formConfigRepo.isLoaded()) {
      this.calculateVisibleLayers();
    }else {
      setTimeout(function() {this.init()}.bind(this), 500);
    }
  }

  public click() {
    const first = this.visibleLayers[0];
    this.addFeature.emit({
      featuretype: first,
    });
  }

  public calculateVisibleLayers(): void {
    const allowFts = this.formConfigRepo.getFeatureTypes();

    const appLayers = this.tailorMapService.getViewerController().getVisibleLayers() as number[];
    appLayers.forEach(appLayerId => {
      const appLayer = this.tailorMapService.getViewerController().getAppLayerById(appLayerId);
      let layerName : string = appLayer.layerName;
      layerName = this.sanitzeLayername(layerName);

      if (allowFts.findIndex(l => l.toLowerCase() === layerName) !== -1) {
        this.visibleLayers.push(layerName);
      }
    });
  }

  private sanitzeLayername(layername : string) : string {
    const index = layername.indexOf(':');
    if (index !== -1) {
      const featureType = layername.substring(0, index);
      layername = layername.substring(index + 1);
    }
    return layername.toLowerCase();
  }
}
