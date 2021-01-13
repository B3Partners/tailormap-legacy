import {
  ExtentChangedEvent,
  LayerVisibilityEvent,
} from '../../core/src/lib/shared/models/event-models';
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
  getApplicationConfig(): App;
}

declare interface GeoServiceLayer {
  name: string;
}

declare interface GeoService {
  id: string;
  layers: Record<string, GeoServiceLayer>;
}

declare interface Level {
  id: string;
  name: string;
  children: string[];
  layers: string[];
  background: boolean;
}

declare interface CQLFilter{
  filters ?: CQLFilter[];
  cql: string;
  id: string;
  operator: string;
  type: 'ATTRIBUTE' | 'GEOMETRY' | 'APPLAYER';
  getCQL : () => string;
  getCQLWithoutType : () => string;
  addFilter : (filter: CQLFilter) => void;
  removeFilter : (filter: CQLFilter) => void;
  removeFilterById : (id : string) => void;
  addOrReplace : (filter: CQLFilter) => void;
}

declare interface AppLayer {
  id: string;
  layerName: string;
  alias: string;
  filter ?: CQLFilter;

  attribute: boolean;   // has attribute table???
  featureType: number;
  background: boolean;
  userlayer: boolean;
  userlayer_original_layername ?: string;
  layerId: number;
}
declare interface Pixel{
  x: number;
  y: number;
}

type MapEvent = (object: any, event: LayerVisibilityEvent | ExtentChangedEvent) => void;
type layerEvent = (object: any, event: any) => void;

declare interface Map {
  addListener: (eventName: string, handler: MapEvent) => void;
  addLayer: (layer: Layer) => void;
  getLayer: (id: string) => Layer;
  update: () => void;
  getResolution: () => number;
  zoomToExtent: (extent: Extent) => void;
  coordinateToPixel: (x: number, y: number) => Pixel;
}

declare interface MapComponent {
  getMap: () => Map;
  createVectorLayer: (config: any) => VectorLayer;
  addListener: (eventName: string, handler: MapEvent) => void;
}

declare interface Layer {
  id: string;
  addListener: (eventName: string, handler: layerEvent, scope: any) => void;
  removeListener: (eventName: string, handler: layerEvent, scope: any) => void;
}

declare interface OLFeatureConfig{
  wktgeom: string;
  id: string;
  attributes: any;
}

declare interface OLFeature{
  config: OLFeatureConfig;
  color: string;
}

declare interface VectorLayer extends Layer {
  getActiveFeature: () => OLFeature;
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
