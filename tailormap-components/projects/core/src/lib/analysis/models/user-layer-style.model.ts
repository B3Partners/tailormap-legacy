export type MakerType = 'circle' | 'square' | 'triangle' | 'arrow' | 'cross' | 'star' | 'x';

export interface UserLayerStyleModel {
  id: string;
  label: string;
  active: boolean;
  fillOpacity: number;
  fillColor: string;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  marker: MakerType;
  markerSize: number;
  markerFillColor: string;
  markerStrokeColor: string;
  minScale?: number;
  maxScale?: number;
}
