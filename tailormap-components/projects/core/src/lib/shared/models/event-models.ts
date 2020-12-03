// import { Layer } from './layer.model';

export interface LayerVisibilityEvent {
  visible: boolean;
  // layername: string;
  // TODO any nog vervangen door juiste type
  layer: any;
}

export interface MapClickedEvent {
  x: number;
  y: number;
  scale: number;
}
