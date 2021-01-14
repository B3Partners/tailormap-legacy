import {
  AttributeListFeature,
  AttributeListParameters,
} from '../../../shared/attribute-service/attribute-models';
import { Feature } from '../../../shared/generated';

export interface TreeDialogData {
  rowsChecked: number;
  tree: AttributelistNode[];
}

export interface AttributelistNode {
  name: string;
  numberOfFeatures: number;
  params: AttributeListParameters;
  isChild: boolean;
  features: AttributeListFeature[];
  children?: AttributelistNode[];
  columnNames?: string[];
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

export interface SelectedTreeData {
  features: AttributeListFeature[];
  columnNames: string[];
  params: AttributeListParameters;
  isChild: boolean;
  name: string;
}
