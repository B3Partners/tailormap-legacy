
import { FeatureNode, FlatNode } from './wegvakken-tree-models';

export class WegvakkenTreeHelpers {

  public static transformer(node: FeatureNode, level: number): FlatNode  {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      feature: node.feature,
      selected: node.selected,
    };
  }
}
