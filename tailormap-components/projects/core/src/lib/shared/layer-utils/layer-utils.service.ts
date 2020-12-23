import { Injectable } from '@angular/core';
import { FormHelpers } from '../../feature-form/form/form-helpers';
import { AppLayer } from '../../../../../bridge/typings';

@Injectable({
  providedIn: 'root',
})
export class LayerUtils {

  private static prefixes = ['gb'];

  constructor() {
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
}
