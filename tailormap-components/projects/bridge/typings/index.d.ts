import { LayerVisibilityEvent } from '../../core/src/lib/shared/layer-visibility-service/layer-visibility-models';

declare interface AppLoader {
  get: (varName: 'viewerController' | 'appId' | 'user' | 'contextPath' | 'absoluteURIPrefix') => any;
}

declare interface GeoService {
  id: string;
}

declare interface AppLayer {
  id: string;
}

type layerEventHandler = (object: any, event: LayerVisibilityEvent) => void;

declare interface OlMap{
  addListener: (eventName: string, handler: layerEventHandler) => void;
}

declare interface MapComponent {

  getMap : () => OlMap;
}

declare interface ViewerController {
  mapComponent: MapComponent;

  isDebug: () => boolean;

  getService: (serviceId: number) => GeoService;
  getAppLayerById: (appLayerId: number) => AppLayer;
  getAppLayer: (serviceId: number, layerName: string) => AppLayer;

  getVisibleLayers: (castToStrings?: boolean) => number[] | string[];
}
