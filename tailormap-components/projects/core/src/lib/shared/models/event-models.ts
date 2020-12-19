import { Extent } from '../../../../../bridge/typings';

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

export interface ExtentChangedEvent{
  extent: Extent;
}
