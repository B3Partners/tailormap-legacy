import { Injectable } from '@angular/core';
import {LayerVisibilityEvent} from "./layer-visibility-models";
import {FormconfigRepositoryService} from "../formconfig-repository/formconfig-repository.service";

@Injectable({
  providedIn: 'root'
})
export class LayerVisibilityServiceService {

  private visibleLayers : string[] = [];
  constructor(
    private formConfigRepo: FormconfigRepositoryService) { }

  public layerVisibiltyChanged(event: LayerVisibilityEvent):void{
    const layerName = event.layername;
    let allowFts = this.formConfigRepo.getFeatureTypes();
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
