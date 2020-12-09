import { TreeModel } from '../models/tree.model';

export class TreeHelper {
  public static hasChildren = (node: TreeModel): boolean => !!node.children;
  public static getChildren = (node: TreeModel): TreeModel[] => node.children;
}
