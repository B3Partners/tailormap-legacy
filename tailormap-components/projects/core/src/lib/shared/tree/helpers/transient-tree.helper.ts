import {
  CheckStateChange,
  TreeService,
} from '../tree.service';
import { TreeModel } from '../models/tree.model';
import {
  BehaviorSubject,
  Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class TransientTreeHelper<T> {

  private treeData: TreeModel[];
  private nodesSubject$ = new BehaviorSubject<TreeModel[]>([]);
  private destroyed = new Subject();

  private nodeCount = 1;

  private selectedNode = new Subject<string>();

  public constructor(
    treeService: TreeService,
    private defaultExpanded = false,
    private isSelected?: (treeNode: TreeModel) => boolean,
    private hasCheckboxes = true,
  ) {
    treeService.setDataSource(this.nodesSubject$.asObservable());
    treeService.setSelectedNode(this.selectedNode.asObservable());

    treeService.checkStateChangedSource$
      .pipe(takeUntil(this.destroyed)).subscribe(change => this.handleCheckStateChange(change));
    treeService.nodeExpansionChangedSource$
      .pipe(takeUntil(this.destroyed)).subscribe(nodeId => this.toggleNodeExpanded(nodeId));

    treeService.selectionStateChangedSource$.pipe(takeUntil(this.destroyed)).subscribe(nodeId => {
      this.selectedNode.next(nodeId);
    });
  }

  public createTree(treeData: TreeModel[]){
    this.treeData = this.createLocalModels(treeData);
    this.nodesSubject$.next(this.treeData);
  }

  public destroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public selectNode(nodeId:string) :void{
    this.selectedNode.next(nodeId);
  }

  private createLocalModels(treeData: TreeModel[]): TreeModel[] {
    return treeData.map(treeModel => {
      const model: TreeModel = {
        ...treeModel,
        children: typeof treeModel.children !== 'undefined' ? this.createLocalModels(treeModel.children) : undefined,
        checked: !this.hasCheckboxes ? undefined : (this.isSelected ? this.isSelected(treeModel) : false),
        expanded: typeof treeModel.children !== 'undefined' ? this.defaultExpanded : undefined,
      }
      return model;
    });
  }

  private handleCheckStateChange(checkStateChange: CheckStateChange) {
    this.treeData = [...this.treeData].map(model => {
      return {
        ...model,
        checked: checkStateChange.has(model.id) ? checkStateChange.get(model.id) : model.checked,
      };
    });
    this.nodesSubject$.next(this.treeData);
  }

  private toggleNodeExpanded(nodeId: string) {
    this.treeData = [...this.treeData].map(model => {
      return {
        ...model,
        expanded: nodeId === model.id ? !model.expanded : model.expanded,
      };
    });
    this.nodesSubject$.next(this.treeData);
  }

}
