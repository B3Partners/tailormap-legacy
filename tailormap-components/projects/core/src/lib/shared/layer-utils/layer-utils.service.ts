import { Injectable } from '@angular/core';
import { AppLayer } from '../../../../../bridge/typings';
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
      allowedFeaturesTypes.push(this.getLayerName(sl));
    } else {
      allowedFeaturesTypes = allFeatureTypes;
    }
    const visibleLayers = this.getVisibleLayerFeatureTypes(false).map(LayerUtils.convertLayerToFeatureType);
    let newAr = allowedFeaturesTypes.filter(value => visibleLayers.includes(value));
    const visibleUserLayers = this.getVisibleLayerFeatureTypes(true).map(LayerUtils.convertLayerToFeatureType);

    newAr = [...newAr, ...visibleUserLayers];
    return newAr;
  }

  public getLayerName(sl: AppLayer): string {
    let layerName = '';
    if (sl.userlayer) {
      layerName = 'ul_' + sl.layerId;
    } else {
      layerName = sl.layerName;
    }
    return layerName;
  }


  private getVisibleLayerFeatureTypes(userLayers: boolean): string[] {
    const visibleLayers = [];

    const appLayers = this.tailorMap.getViewerController().getVisibleLayers();
    appLayers.forEach(appLayerId => {
      const appLayer = this.tailorMap.getViewerController().getAppLayerById(appLayerId);
      if ((userLayers && appLayer.userlayer) || (!userLayers && !appLayer.userlayer)) {
        const layerName = this.getLayerName(appLayer);
        visibleLayers.push(layerName);
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
