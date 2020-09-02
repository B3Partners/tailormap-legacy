import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AddButtonEvent} from "./add-feature-models";
import {LayerVisibilityServiceService} from "../../shared/layer-visibility-service/layer-visibility-service.service";

@Component({
  selector: 'tailormap-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css']
})
export class AddFeatureComponent implements OnInit {

  @Output()
  public addFeature = new EventEmitter<AddButtonEvent>();

  constructor(
    public layerVisible: LayerVisibilityServiceService
  ){ }

  ngOnInit() {
  }

  public click(){
    let first = this.layerVisible.getVisibleLayers()[0];
    this.addFeature.emit({
      featuretype:first
    });
  }
}
