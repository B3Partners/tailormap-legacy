export interface LayerVisibilityEvent {
  visible: boolean;
  layer: LayerVisibilityLayer;
}

export interface LayerVisibilityLayer {
  id: number
}

export interface MapClickedEvent {
  x: number;
  y: number;
  scale: number;
}
