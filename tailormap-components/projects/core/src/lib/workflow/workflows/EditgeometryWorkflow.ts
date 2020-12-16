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

  public addFeature(featureType: string, geometryType?: string): void {
    const a = 0;
  }

  public afterEditting(): void {
    const a = 0;
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

  public setFeature(feature: Feature): void {
    const a = 0;
  }

}
