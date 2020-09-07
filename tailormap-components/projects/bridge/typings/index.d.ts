declare interface AppLoader {
  get: (varName: 'viewerController' | 'appId' | 'user' | 'contextPath' | 'absoluteURIPrefix') => any;
}

declare interface GeoService {
  id: string;
}

declare interface AppLayer {
  id: string;
}


declare interface ViewerController {
  isDebug: () => boolean;

  getService: (serviceId: number) => GeoService;
  getAppLayerById: (appLayerId: number) => AppLayer;
  getAppLayer: (serviceId: number, layerName: string) => AppLayer;

  getVisibleLayers: (castToStrings?: boolean) => number[] | string[];

}
