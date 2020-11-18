import {
  App,
  AppLayer,
  GeoService,
  layerVisibilityEvent,
  MapComponent,
} from './Mapcomponents';
import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/event-models';

declare interface LayerSelectedEvent{
  appLayer: AppLayer;
  layerName: string;
  nodeId: string;
  service: number
}

type layerEventHandler = ( payload: LayerSelectedEvent) => void;

declare interface ViewerController {

  app: App;
  mapComponent: MapComponent;

  isDebug: () => boolean;

  getService: (serviceId: number) => GeoService;
  getAppLayerById: (appLayerId: number) => AppLayer;
  getAppLayer: (serviceId: number, layerName: string) => AppLayer;
  setFilterString: (filter: string, appLayer : AppLayer, name: string) => void;

  addListener: (eventName: string, handler: layerEventHandler) => void;

  getVisibleLayers(): number[];
  // tslint:disable-next-line:unified-signatures
  getVisibleLayers(castToStrings: false): number[];
  getVisibleLayers(castToStrings: true): string[];

}
