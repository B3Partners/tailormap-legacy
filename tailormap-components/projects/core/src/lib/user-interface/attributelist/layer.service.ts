
import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Layer } from './layer.model';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
// import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';

@Injectable({
  providedIn: 'root',
})
export class LayerService {

  // List of layers. The index is also the associated tab index.
  public layers: Layer[] = [];

  constructor(public tailorMapService: TailorMapService,
              private ngZone: NgZone) {
    // Install the layerVisibilityChanged handler.
    this.tailorMapService.layerVisibilityChanged$.subscribe(value => {
      this.ngZone.run(() => {
        this.loadLayers();
      });
    });
  }

  public getAppId(): number {
    const vc = this.tailorMapService.getViewerController();
    return vc.app.id;
  }

  public getLayers$(): Observable<Layer[]> {
    this.loadLayers();
    return of(this.layers);
  }

  /**
   * Returns the id of an app layer. It can be a layer which is not
   * visible in the map.
   * Returns -1 when not found.
   */
  public getAppLayerId(appId: number, layerName: string): number {
    const vc = this.tailorMapService.getViewerController();
    const appLayer = vc.getAppLayer(appId, layerName);
    if (appLayer) {
      return parseInt(appLayer.id, 10);
    }  else {
      return -1;
    }
  }

  /**
   * Returns null when not found.
   */
  public getLayerByName(layerName: string): Layer {
    for (const layer of this.layers) {
      if (layer.name === layerName) {
        return layer;
      }
    }
    return null;
  }

  /**
   * Returns null when no valid tab index.
   */
  public getLayerByTabIndex(tabIndex: number): Layer {
    if ((tabIndex < 0) || (tabIndex > this.layers.length - 1)) {
      console.log('LayerService.getLayer - No valid index.');
      return null;
    }
    return this.layers[tabIndex];
  }

  /**
   * Returns null when no valid index.
   */
  public getTabComponent(index: number): AttributelistTabComponent {
    if ((index < 0) || (index > this.layers.length - 1)) {
      console.log('LayerService.getTabComponent - No valid index.');
      return null;
    }
    return this.layers[index].tabComponent;
  }

  public loadLayers(): void {
    // console.log('#LayerService - loadLayers');

    // Clear the array, but keep the array reference for automatic update.
    this.layers.splice(0, this.layers.length);

    const vc = this.tailorMapService.getViewerController();
    const layerIds = vc.getVisibleLayers() as number[];
    // console.log(layerIds);

    layerIds.forEach(layerId => {
      const appLayer = vc.getAppLayerById(layerId);

      // Is there a attribute table?
      if (appLayer.attribute) {
        const layerName = this.sanitizeLayername(appLayer.layerName);
        // console.log('layerName: ' + layerName);
        // console.log(appLayer);
        const layer: Layer = {
          name: layerName,
          id: layerId,
          tabComponent: null,
        };
        // console.log(layer);
        this.layers.push(layer);
      }
    });
  }

  /**
   * Binds the tab to the layer.
   */
  public registerTabComponent(index: number, tab: AttributelistTabComponent): void {
    if ((index < 0) || (index > this.layers.length - 1)) {
      console.log('LayerService.registerTabComponent - No valid index.');
      return;
    }
    this.layers[index].tabComponent = tab;
  }

  /**
   * Returns part from full layer name before ":". Converts to lowercase too.
   */
  private sanitizeLayername(layername: string): string {
    const index = layername.indexOf(':');
    if (index !== -1) {
      layername = layername.substring(index + 1);
    }
    return layername.toLowerCase();
  }

  public test(): void {
    // const vc = this.tailorMapService.getViewerController();
    // const layerIds = vc.get;
  }
}
