import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerUtils {

  constructor() { }


  public static sanitzeLayername(layername: string): string {
    const index = layername.indexOf(':');
    if (index !== -1) {
      layername = layername.substring(index + 1);
    }
    return layername.toLowerCase();
  }
}
