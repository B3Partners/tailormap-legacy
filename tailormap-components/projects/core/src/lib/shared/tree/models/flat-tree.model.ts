export interface FlatTreeModel<T = any> {
  id: string;
  label: string;
  level: number;
  expanded: boolean;
  expandable: boolean;
  checked: boolean;
  checkbox: boolean;
  type?: string;
  metadata?: T;
  readOnlyItem?: boolean;
}
