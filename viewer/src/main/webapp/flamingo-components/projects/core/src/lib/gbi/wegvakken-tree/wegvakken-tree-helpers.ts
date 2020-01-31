
import { FeatureNode } from './wegvakken-tree-models';

export class WegvakkenTreeHelpers {

  public static transformer(node: FeatureNode, level: number)  {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
    };
  }
}
