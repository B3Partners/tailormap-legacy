import { Injectable } from '@angular/core';
import { FormHelpers } from '../../feature-form/form/form-helpers';

@Injectable({
  providedIn: 'root',
})
export class LayerUtils {

  private static prefixes = ['gb'];

  constructor() {
  }


  public static sanitzeLayername(layername: string): string {
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
