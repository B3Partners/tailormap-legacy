export interface LayerVisibilityEvent {
  visible: boolean;
  layername: string;
}

export interface MapClickedEvent {
  x: number;
  y: number;
  scale: number;
}
