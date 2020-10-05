import {
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
  mapComponent: MapComponent;

  isDebug: () => boolean;

  getService: (serviceId: number) => GeoService;
  getAppLayerById: (appLayerId: number) => AppLayer;
  getAppLayer: (serviceId: number, layerName: string) => AppLayer;

  getVisibleLayers: (castToStrings?: boolean) => number[] | string[];
  addListener: (eventName: string, handler: layerEventHandler) => void;
}
