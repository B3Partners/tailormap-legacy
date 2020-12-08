
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
} from 'rxjs';

import { Layer } from './layer.model';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { HighlightService } from '../../shared/highlight-service/highlight.service';

@Injectable({
  providedIn: 'root',
})
export class LayerService {

  // List of layers. The index is also the associated tab index.
  public layers: Layer[] = [];
  private layersSubject = new BehaviorSubject<Layer[]>([]);
  public layers$ = this.layersSubject.asObservable();

  constructor(private tailorMapService: TailorMapService,
              private highlightService: HighlightService) {
    // Install the layerVisibilityChanged handler.
    this.tailorMapService.layerVisibilityChanged$.subscribe(value => {
      // layerVisibilityChanged visible to true occurs too often (also if layer is already visible)
      // console.log ('LayerService visi changed value: ' + value.visible);
      if (value.visible) {
        if (!this.isLayerIdInLayers(value.layer.id)) {
          this.addLayer(value.layer.id);
        }
      } else {
        if (this.isLayerIdInLayers(value.layer.id)) {
          this.removeLayer(value.layer.id);
        }
      }
      this.layersSubject.next(this.layers);
    });
    this.loadLayers();
  }

  // /**
  //  * Returns part from full layer name before ":". Converts to lowercase too.
  //  */
  // private static sanitizeLayername(layerName: string): string {
  //   const index = layerName.indexOf(':');
  //   if (index !== -1) {
  //     layerName = layerName.substring(index + 1);
  //   }
  //   return layerName.toLowerCase();
  // }

  private isLayerIdInLayers (layerId): boolean {
    return (this.layers.find( layer => layer.id === layerId ) !== undefined);
  }

  public getAppId(): number {
    const vc = this.tailorMapService.getViewerController();
    return vc.app.id;
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
      // console.log('LayerService.getLayer - No valid index.');
      return null;
    }
    return this.layers[tabIndex];
  }

  /**
   * Returns -1 when no valid index.
   */
  public getTabIndexByLayerId(layerId: number): number {
    return (this.layers.findIndex( obj => obj.id === layerId));
  }

  /**
   * Returns null when no valid index.
   */
  public getTabComponent(index: number): AttributelistTabComponent {
    if ((index < 0) || (index > this.layers.length - 1)) {
      // console.log('LayerService.getTabComponent - No valid index.');
      return null;
    }
    return this.layers[index].tabComponent;
  }

  /**
   * Loads the visible layers.
   * Is triggered when a layer in the TOC is (un)checked.
   */
  public loadLayers(): void {
    // console.log('#LayerService - loadLayers');

    // Clear highlighting.
    this.highlightService.clearHighlight();

    // Clear the array, but keep the array reference for automatic update.
    this.layers.splice(0, this.layers.length);

    const vc = this.tailorMapService.getViewerController();
    const layerIds = vc.getVisibleLayers();
    // console.log(layerIds);

    layerIds.forEach(layerId => {
      this.addLayer(layerId);
    });

    this.layersSubject.next(this.layers);
  }

  private addLayer (layerId: number) {
    const vc = this.tailorMapService.getViewerController();
    const appLayer = vc.getAppLayerById(layerId);

    // Is there a attribute table?
    if (appLayer.attribute) {
      const layerName = LayerUtils.sanitizeLayername(appLayer.layerName);
      // console.log('layer.service addLayer: ' + layerName);

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

  }

  private removeLayer (layerId: number) {
    // Clear highlighting.
    this.highlightService.clearHighlight();

    const tabIndex = this.getTabIndexByLayerId(layerId) as number;
    if (tabIndex >= 0) {
      const saveLayerId: number[] = [];
      for (let i = tabIndex + 1; i < this.layers.length; i++) {
        saveLayerId.push (this.layers[i].id)
      }
      // remove until end otherwise removing/loading table is not correct (tab/table removes always from the back of the list)
      this.layers.splice(tabIndex, this.layers.length - tabIndex);

      // wait to let tab/table cleanup
      setTimeout(() => {
        // reload layers until the end of the tabs
        saveLayerId.forEach(id => {
          this.addLayer(id);
        });
      }, 0)
    }

  }

  /**
   * Binds the tab to the layer.
   */
  public registerTabComponent(index: number, tab: AttributelistTabComponent): void {
    if ((index < 0) || (index > this.layers.length - 1)) {
      // console.log('LayerService.registerTabComponent - No valid index.');
      return;
    }
    this.layers[index].tabComponent = tab;
    this.layersSubject.next(this.layers);
  }

  public test(): void {
    // const vc = this.tailorMapService.getViewerController();
    // const layerIds = vc.get;
  }
}
