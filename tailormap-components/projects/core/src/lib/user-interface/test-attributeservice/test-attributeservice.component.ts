import {
  Component,
  OnInit,
} from '@angular/core';
import { AttributeService } from '../../shared/attribute-service/attribute.service';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { LayerVisibilityEvent } from '../../shared/models/layer-visibility-models';

@Component({
  selector: 'tailormap-test-attributeservice',
  templateUrl: './test-attributeservice.component.html',
  styleUrls: ['./test-attributeservice.component.css'],
})
export class TestAttributeserviceComponent implements OnInit {

  constructor(
      private tailorMap: TailorMapService,
  ) { }

  public ngOnInit() {
  }

  public click() {
   /* let params: AttributeListParameters = {
      appLayer: 16,
      application: 3,
      featureType: 169,
      limit: 4
    };
    this.service.featureTypeMetadata(params)
      .subscribe(value => {
        console.log('testrelate', value.relations[0].type == RelationType.RELATE);
        console.log('testjoin', value.relations[0].type == RelationType.JOIN);
      });*/

    // via directe aanroep ext functies
    const vc = this.tailorMap.getViewerController();
    const mc = vc.mapComponent;
    const map = mc.getMap();
    map.addListener('ON_LAYER_VISIBILITY_CHANGED', function(object: any, event: LayerVisibilityEvent) {
      this.layerVisChanged(event);
    }.bind(this));

    // via observables
    this.tailorMap.layerVisibilityChanged$.subscribe(this.layerVisChanged);
  }

  public layerVisChanged ( event: LayerVisibilityEvent) {
    console.log('layervischanged: ', event);
  }
}
