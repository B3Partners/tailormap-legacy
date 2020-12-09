import { MatTreeFlattener } from '@angular/material/tree';
import { TreeHelper } from './tree.helper';
import { TreeModel } from '../models/tree.model';
import { FlatTreeModel } from '../models/flat-tree.model';

export class FlatTreeHelper {

  public static getTreeFlattener() {
    return new MatTreeFlattener(
      FlatTreeHelper.transformer, FlatTreeHelper.getLevel, FlatTreeHelper.isExpandable, TreeHelper.getChildren,
    );
  }

  public static transformer(node: TreeModel, level: number): FlatTreeModel {
    return {
      id: node.id,
      label: node.label,
      level,
      expanded: node.expanded,
      expandable: TreeHelper.hasChildren(node),
      checked: node.checked,
      checkbox: typeof node.checked !== 'undefined',
      type: node.type,
      metadata: node.metadata,
      readOnlyItem: typeof node.readOnlyItem !== 'undefined' ? node.readOnlyItem : false,
    };
  }

  public static getLevel = (node: FlatTreeModel) => node.level;
  public static isExpandable = (node: FlatTreeModel) => node.expandable;

  public static getParentNode(node: FlatTreeModel, nodes: FlatTreeModel[]): FlatTreeModel | null {
    const currentLevel = FlatTreeHelper.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = nodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = nodes[i];
      if (FlatTreeHelper.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

}
