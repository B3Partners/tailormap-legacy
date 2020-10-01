import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/layer-visibility-models';

declare interface AppLoader {
  get: (varName: 'viewerController' | 'appId' | 'user' | 'contextPath' | 'absoluteURIPrefix') => any;
}

declare interface GeoService {
  id: string;
}

declare interface AppLayer {
  id: string;
  layerName: string;
}

type layerVisibilityEvent = (object: any, event: LayerVisibilityEvent) => void;

declare interface Map{
  addListener: (eventName: string, handler: layerVisibilityEvent) => void;
}

declare interface MapComponent {
  getMap : () => Map;
}
