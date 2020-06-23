import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DialogClosedData} from "../../feature-form/form-popup/form-popup-models";
import {AddButtonEvent} from "./add-feature-models";
import {FeatureTypes} from "../../shared/feature-initializer/feature-initializer-models";
import {LayerVisibilityServiceService} from "../../shared/layer-visibility-service/layer-visibility-service.service";

@Component({
  selector: 'flamingo-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css']
})
export class AddFeatureComponent implements OnInit {

  @Output()
  public addFeature = new EventEmitter<AddButtonEvent>();

  public visibleFeatureTypes:string[];
  constructor(
    private layerVisible: LayerVisibilityServiceService
  ){

  }



  ngOnInit() {
  }

  public click(){
    let first = this.layerVisible.getVisibleLayers()[0];
    this.addFeature.emit({
      featuretype:first
    });
  }
}
