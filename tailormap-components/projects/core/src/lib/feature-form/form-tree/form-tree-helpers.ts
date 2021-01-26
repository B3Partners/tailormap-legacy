import {
  FeatureNode,
  FlatNode,
} from './form-tree-models';

export class FormTreeHelpers {

  public static transformer(node: FeatureNode, level: number): FlatNode {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      feature: node.feature,
      isFeatureType: node.isFeatureType,
      selected: node.selected,
    };
  }
}
