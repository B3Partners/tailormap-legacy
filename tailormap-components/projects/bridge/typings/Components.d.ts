import {
  App,
  AppLayer,
  GeoService,
  MapComponent,
} from './Mapcomponents';

declare interface ViewerController {

  app: App;
  mapComponent: MapComponent;

  isDebug: () => boolean;

  getService: (serviceId: number) => GeoService;
  getAppLayerById: (appLayerId: number) => AppLayer;
  getAppLayer: (serviceId: number, layerName: string) => AppLayer;

  getVisibleLayers: (castToStrings?: boolean) => number[] | string[];
}
