export interface UserLayerStyleModel {
  id: string;
  active: boolean;
  fillOpacity: number;
  fillColor: string;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  marker: 'circle' | 'square' | 'triangle' | 'arrow' | 'cross' | 'star' | 'x';
  markerSize: number;
  markerFillColor: string;
  markerStrokeColor: string;
  scale?: number;
}
