export interface NodePositionChangedEventModel {
  nodeId: string;
  fromParent: string | null;
  toParent: string | null;
  sibling: string;
  position: 'before' | 'after' | 'inside';
}
