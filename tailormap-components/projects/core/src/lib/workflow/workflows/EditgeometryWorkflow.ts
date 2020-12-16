import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
export class EditgeometryWorkflow extends Workflow {

  private featureType: string;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    setTimeout( this.drawGeom.bind(this),100);
  }

  public drawGeom() : void{

    const feat = this.event.feature
    const geom = this.featureInitializerService.retrieveGeometry(feat);
    if (geom) {
      this.vectorLayer.readGeoJSON(geom);
    }
  }

  public afterEditting() {
    const a=0;
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
    const a = 0;
  }

  public getDestinationFeatures(): Feature[] {
    const a = 0;
    return [];
  }

  public mapClick(data: MapClickedEvent): void {
    const a = 0;
  }

}
