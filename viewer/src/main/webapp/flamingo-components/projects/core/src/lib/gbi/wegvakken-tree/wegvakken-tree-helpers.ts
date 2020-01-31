
import { FeatureNode } from '../../shared/wegvakken-models';

export class WegvakkenTreeHelpers {

  public transformer(node: FeatureNode, level: number)  {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
    };
  }
}
