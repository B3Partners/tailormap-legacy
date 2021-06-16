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
      allowedFeaturesTypes.push( this.getLayerName(sl));
    } else {
      allowedFeaturesTypes = allFeatureTypes;
    }
    const visibleLayers = this.getVisibleLayers(false);
    let newAr = allowedFeaturesTypes.filter(value => visibleLayers.includes(value));
    const visibleUserLayers = this.getVisibleLayers(true);

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


  private getVisibleLayers(userLayers: boolean): string[] {
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
}
