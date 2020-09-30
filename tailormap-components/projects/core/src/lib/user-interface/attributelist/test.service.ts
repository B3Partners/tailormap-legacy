/**
 * Service for global test settings.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TestService {

  public getAttributeUrl(layerName: string): string {
    let url = '';
    if (this.isTestApp()) {
      url = `assets/json/${layerName.toLowerCase()}-attributes.json`;
    } else {
      url = `http://localhost:3200/assets/json/${layerName.toLowerCase()}-attributes.json`;
    }
    return url;
  }

  public getLayerUrl(): string {
    let url = '';
    if (this.isTestApp()) {
      url = 'assets/json/layers.json';
    } else {
      url = 'http://localhost:3200/assets/json/layers.json';
    }
    return url;
  }

  public isTestApp(): boolean {
    const elems = document.getElementsByTagName('tailormap-root');
    if (elems.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
