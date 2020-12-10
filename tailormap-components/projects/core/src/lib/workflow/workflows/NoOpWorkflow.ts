import { Workflow } from './Workflow';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';

export class NoOpWorkflow extends Workflow {
  public addFeature(featureType: string, geometryType?: string): void {
  }

  public afterEditting(): void {
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

  public mapClick(data: MapClickedEvent): void {
  }

  public setFeature(feature: Feature): void {
  }

}
