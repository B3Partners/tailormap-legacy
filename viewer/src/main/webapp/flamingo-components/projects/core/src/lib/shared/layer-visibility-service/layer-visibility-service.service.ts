import { Injectable } from '@angular/core';
import {LayerVisibilityEvent} from "./layer-visibility-models";
import {FeatureTypes} from "../feature-initializer/feature-initializer-models";

@Injectable({
  providedIn: 'root'
})
export class LayerVisibilityServiceService {

  private visibleLayers : string[] = [];
  constructor() { }

  public layerVisibiltyChanged(event: LayerVisibilityEvent):void{
    const layerName = event.layername;
    let allowFts = Object.values(FeatureTypes);
    const isOfFormType = allowFts.findIndex(l => l.toLowerCase() === layerName.toLowerCase());
    if(isOfFormType !== -1) {
      const idx = this.visibleLayers.findIndex(l => l === layerName);
      if (event.visible) {
        if (idx === -1) {
          this.visibleLayers.push(layerName);
        }
      } else {
        this.visibleLayers = [
          ...this.visibleLayers.slice(0, idx),
          ...this.visibleLayers.slice(idx + 1)];
      }
    }
  }

  public getVisibleLayers(): string[]{
    return this.visibleLayers;
  }
}
