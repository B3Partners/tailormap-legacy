
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
} from 'rxjs';

import { Layer } from './layer.model';
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
      console.log ('LayerService visi changed value: ' + value);
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

  /**
   * Returns part from full layer name before ":". Converts to lowercase too.
   */
  private static sanitizeLayername(layerName: string): string {
    const index = layerName.indexOf(':');
    if (index !== -1) {
      layerName = layerName.substring(index + 1);
    }
    return layerName.toLowerCase();
  }

  private isLayerIdInLayers (layerId): boolean {
    let layerFound = false;
    let index = 0;
    while (index < this.layers.length && !layerFound) {
      layerFound = (this.layers[index].id === layerId);
      index++;
    }
    return layerFound;
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
      console.log('LayerService.getLayer - No valid index.');
      return null;
    }
    return this.layers[tabIndex];
  }

  /**
   * Returns -1 when no valid index.
   */
  public getTabIndexByLayerId(layerId: number): number {
    let tabIndex = -1;
    let index = 0;
    while (index < this.layers.length && tabIndex === -1) {
      if (this.layers[index].id === layerId) {
        tabIndex = index;
      }
      index++;
    }
    return tabIndex;
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
      const layerName = LayerService.sanitizeLayername(appLayer.layerName);
      console.log('layer.service addLayer: ' + layerName);

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

    const layerIndex = this.getTabIndexByLayerId(layerId) as number;
    // // adjust the tabs according to the shifted layers
    // for (let i = layerIndex + 1; i < this.layers.length; i++) {
    //   this.layers[i].tabComponent.tabIndex = i;
    // }
    this.layers.splice(layerIndex, 1);
    // adjust the tabindex according to the shifted layers
    for (let i = layerIndex; i < this.layers.length; i++) {
      this.layers[i].tabComponent.tabIndex = i;
      this.layers[i].tabComponent.setTabIndex(i);
    }
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
    this.layersSubject.next(this.layers);
  }

  public test(): void {
    // const vc = this.tailorMapService.getViewerController();
    // const layerIds = vc.get;
  }
}
