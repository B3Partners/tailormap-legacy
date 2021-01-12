import { Injectable } from '@angular/core';
import { FormHelpers } from '../../feature-form/form/form-helpers';
import { AppLayer } from '../../../../../bridge/typings';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FormconfigRepositoryService } from '../formconfig-repository/formconfig-repository.service';

@Injectable({
  providedIn: 'root',
})
export class LayerUtils {

  private static prefixes = ['gb'];

  constructor(private tailorMap: TailorMapService) {
  }

  public static sanitizeLayername(layer: string | AppLayer): string {
    let layername;
    if (typeof layer === 'string') {
      layername = layer;
    } else {
      layername = layer.userlayer ? layer.userlayer_original_layername : layer.layerName;
    }
    const index = layername.indexOf(':');
    if (index !== -1) {
      layername = layername.substring(index + 1);
    }
    for (const prefix of this.prefixes) {
      if (layername.startsWith(prefix)) {
        layername = layername.substring(prefix.length);
        break;
      }
    }
    return FormHelpers.snakecaseToCamel(layername).toLowerCase();
  }

  public getFeatureTypesAllowed(allFeatureTypes : string[]): string[] {
    let allowedFeaturesTypes = [];
    const sl = this.tailorMap.selectedLayer;
    if (sl) {
      allowedFeaturesTypes.push( this.getLayerName(sl));
    } else {
      allowedFeaturesTypes = allFeatureTypes;
    }
    const visibleLayers = this.getVisibleLayers(false);
    let newAr = allowedFeaturesTypes.filter(value => visibleLayers.includes(value))
    const visibleUserLayers = this.getVisibleLayers(true);

    newAr = [...newAr, ...visibleUserLayers];
    return newAr;
  }

  public getLayerName(sl: AppLayer): string{
    let layerName = '';
    if (sl.userlayer) {
      layerName = 'ul_' + sl.layerId;
    } else {
      layerName = LayerUtils.sanitizeLayername(sl);
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
