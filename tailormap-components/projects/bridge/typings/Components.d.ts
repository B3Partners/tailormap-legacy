import {
  App,
  AppLayer,
  GeoService,
  GeoServiceLayer,
  MapEvent,
  MapComponent,
  SelectedContentItem,
  VectorLayer,
} from './Mapcomponents';
import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/event-models';

declare interface LayerSelectedEvent{
  appLayer: AppLayer;
  layerName: string;
  nodeId: string;
  service: number
}

type deactivationEvent = ( ) => void;
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
  getComponentsByClassNames: (classNames : string[]) => TailormapComponent[];

  registerSnappingLayer: (vectorLayer: VectorLayer) => void;

  getVisibleLayers(): number[];
  // tslint:disable-next-line:unified-signatures
  getVisibleLayers(castToStrings: false): number[];
  getVisibleLayers(castToStrings: true): string[];

  addUserLayer(appLayer: AppLayer, levelId: string, service: GeoService): void;
  removeUserLayer(appLayer: AppLayer): void;
}
declare interface TailormapComponent{
  getContentContainer: () => string;
  addListener: (eventName: string, handler: deactivationEvent, scope: any) => void;
}

declare interface ExtPopupWindow {
  isVisible: () => boolean;
}

declare interface SplitComponent extends TailormapComponent{
  showWindow: () => void;
  popup: ExtPopupWindow;
}


declare interface MergeComponent extends TailormapComponent{
  showWindow: () => void;
  mode : string;
  popup: ExtPopupWindow;
}
