import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/layer-visibility-models';

declare interface App {
  id: number;
}

declare interface AppLoader {
  get: (varName: 'viewerController' | 'appId' | 'user' | 'contextPath' | 'absoluteURIPrefix') => any;
}

declare interface GeoService {
  id: string;
}

declare interface AppLayer {
  id: string;
  layerName: string;

  attribute: boolean;   // has attribute table???
  featureType: number;
}

type layerEventHandler = (object: any, event: LayerVisibilityEvent) => void;

declare interface Map{
  addListener: (eventName: string, handler: layerEventHandler) => void;
}

declare interface MapComponent {
  getMap : () => Map;
}
