import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/event-models';
import { Geometry } from '../../core/src/lib/shared/generated';

declare interface App {
  id: number;
  selectedContent: SelectedContentItem[];
  appLayers: Record<string, AppLayer>;
  levels: Record<string, Level>;
}

declare interface SelectedContentItem {
  type: 'level' | 'appLayer';
  id: string;
}

declare interface AppLoader {
  get: (varName: 'viewerController' | 'appId' | 'user' | 'contextPath' | 'absoluteURIPrefix') => any;
}

declare interface GeoService {
  id: string;
}

declare interface Level {
  id: string;
  name: string;
  children: string[];
  layers: string[];
  background: boolean;
}

declare interface AppLayer {
  id: string;
  layerName: string;
  alias: string;

  attribute: boolean;   // has attribute table???
  featureType: number;
}

type layerVisibilityEvent = (object: any, event: LayerVisibilityEvent) => void;
type layerEvent = (object: any, event: any) => void;

declare interface Map {
  addListener: (eventName: string, handler: layerVisibilityEvent) => void;
  addLayer: (layer: Layer) => void;
  getLayer: (id: string) => Layer;
  update: () => void;
  getResolution: () => number;
  zoomToExtent: (extent: Extent) => void;
}

declare interface MapComponent {
  getMap: () => Map;
  createVectorLayer: (config: any) => VectorLayer;
}

declare interface Layer {
  id: string;
  addListener: (eventName: string, handler: layerEvent, scope: any) => void;
  removeListener: (eventName: string, handler: layerEvent, scope: any) => void;
}

declare interface VectorLayer extends Layer {
  addFeatureFromWKT: (wkt: string) => void;
  drawFeature: (geometryType: string) => void;
  readGeoJSON: (geojson: Geometry) => void;
  removeAllFeatures: () => void;
}

declare interface Extent {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}
