export interface TreeModel<T = any> {
  id: string;
  label: string;
  children?: TreeModel<T>[];
  checked?: boolean;
  expanded?: boolean;
  type?: string;
  metadata?: T;
  readOnlyItem?: boolean;
}
