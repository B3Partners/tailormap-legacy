import { Injectable } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';

@Injectable({
  providedIn: 'root',
})
export class LayerUtils {

  constructor(
    private tailorMap: TailorMapService) {
  }

  public getFeatureTypesAllowed(allFeatureTypes: string[], useSelectedLayerFilter: boolean = true): string[] {
    let allowedFeaturesTypes = [];
    const sl = this.tailorMap.selectedLayer;
    if (sl && useSelectedLayerFilter) {
      allowedFeaturesTypes.push(sl.layerName);
    } else {
      allowedFeaturesTypes = allFeatureTypes;
    }
    const visibleLayers = this.getVisibleLayerFeatureTypes(false).map(LayerUtils.convertLayerToFeatureType);
    let newAr = allowedFeaturesTypes.filter(value => visibleLayers.includes(value));
    const visibleUserLayers = this.getVisibleLayerFeatureTypes(true).map(LayerUtils.convertLayerToFeatureType);

    newAr = [...newAr, ...visibleUserLayers];
    return newAr;
  }

  private getVisibleLayerFeatureTypes(userLayers: boolean): string[] {
    const visibleLayers = [];

    const appLayers = this.tailorMap.getViewerController().getVisibleLayers();
    appLayers.forEach(appLayerId => {
      const appLayer = this.tailorMap.getViewerController().getAppLayerById(appLayerId);
      if ((userLayers && appLayer.userlayer) || (!userLayers && !appLayer.userlayer)) {
        visibleLayers.push(appLayer.layerName);
      }
    });
    return visibleLayers;
  }

  private static convertLayerToFeatureType(layer: string) {
    const idx = layer.indexOf(':');
    if (idx !== -1) {
      return layer.slice(idx + 1);
    }
    return layer;
  }

}
