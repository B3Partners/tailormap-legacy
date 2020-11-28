import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatTreeHelper } from './helpers/flat-tree.helper';
import { MatTreeFlatDataSource } from '@angular/material/tree';
import { TreeModel } from './models/tree.model';
import { NodePositionChangedEventModel } from './models/node-position-changed-event.model';
import { FlatTreeModel } from './models/flat-tree.model';

export type CheckStateChange = Map<string, boolean>;

@Injectable()
export class TreeService implements OnDestroy {

  private subscriptions: Subscription = new Subscription();

  // Observable string sources
  private treeDataSource = new BehaviorSubject<TreeModel[]>([]);
  private selectedNode = new BehaviorSubject<string>('');
  private readonlyMode = new BehaviorSubject<boolean>(false);
  private checkStateChangedSource = new Subject<CheckStateChange>();
  private selectionStateChangedSource = new Subject<string>();
  private nodeExpansionChangedSource = new Subject<string>();
  private nodePositionChangedSource = new Subject<NodePositionChangedEventModel>();

  // Observable string streams
  public treeDataSource$ = this.treeDataSource.asObservable();
  public selectedNode$ = this.selectedNode.asObservable();
  public readonlyMode$ = this.readonlyMode.asObservable();
  public checkStateChangedSource$ = this.checkStateChangedSource.asObservable();
  public selectionStateChangedSource$ = this.selectionStateChangedSource.asObservable();
  public nodeExpansionChangedSource$ = this.nodeExpansionChangedSource.asObservable();
  public nodePositionChangedSource$ = this.nodePositionChangedSource.asObservable();

  private nodesMap = new Map<string, FlatTreeModel>();
  public checkedMap = new Map<string, boolean>();
  public indeterminateMap = new Map<string, boolean>();

  private readonly treeControl: FlatTreeControl<FlatTreeModel>;
  private readonly dataSource: MatTreeFlatDataSource<TreeModel, FlatTreeModel>;

  public constructor(private ngZone: NgZone) {
    this.treeControl = new FlatTreeControl<FlatTreeModel>(FlatTreeHelper.getLevel, FlatTreeHelper.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, FlatTreeHelper.getTreeFlattener());
    this.dataSource.data = [];
    this.treeControl.dataNodes = [];
  }

  public getTreeControl() {
    return this.treeControl;
  }

  public getDataNodes() {
    return this.treeControl.dataNodes;
  }

  public getTreeDataSource() {
    return this.dataSource;
  }

  public hasNode(nodeId: string) {
    return this.nodesMap.has(nodeId);
  }

  public isExpandable(nodeId: string) {
    if (this.nodesMap.has(nodeId)) {
      return this.treeControl.isExpandable(this.nodesMap.get(nodeId));
    }
    return false;
  }

  public isReadonlyNode(nodeId: string) {
    if (this.nodesMap.has(nodeId)) {
      return this.nodesMap.get(nodeId).readOnlyItem;
    }
    return false;
  }

  public isExpanded(nodeId: string) {
    if (this.nodesMap.has(nodeId)) {
      return this.treeControl.isExpanded(this.nodesMap.get(nodeId));
    }
    return false;
  }

  public expandNode(nodeId: string) {
    if (this.nodesMap.has(nodeId)) {
      this.treeControl.expand(this.nodesMap.get(nodeId));
      this.nodeExpanded(nodeId);
    }
    return false;
  }

  public getParent(nodeId: string) {
    if (!this.nodesMap.has(nodeId)) {
      return null;
    }
    const parent = FlatTreeHelper.getParentNode(this.nodesMap.get(nodeId), this.treeControl.dataNodes);
    if (parent) {
      return parent.id;
    }
    return null;
  }

  // Service message commands
  public setDataSource(dataSource$: Observable<TreeModel[]>) {
    this.subscriptions.add(dataSource$.subscribe(data => {
      this.treeDataSource.next(data);
      this.rebuildTreeForData(data);
    }));
  }

  public setSelectedNode(selectedNode$: Observable<string>) {
    this.subscriptions.add(selectedNode$.subscribe(data => this.selectedNode.next(data)));
  }

  public setReadOnlyMode(readonlyMode: boolean) {
    this.readonlyMode.next(readonlyMode);
  }

  public checkStateChanged(stateChange: CheckStateChange) {
    this.ngZone.run(() => {
      this.checkStateChangedSource.next(stateChange);
      this.updateCaches();
    });
  }

  public selectionStateChanged(nodeId: string) {
    this.ngZone.run(() => this.selectionStateChangedSource.next(nodeId));
  }

  public nodeExpanded(nodeId: string) {
    this.ngZone.run(() => this.nodeExpansionChangedSource.next(nodeId));
  }

  public nodePositionChanged(evt: NodePositionChangedEventModel) {
    this.ngZone.run(() => this.nodePositionChangedSource.next(evt));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public hasNodes(): boolean {
    return this.treeDataSource.getValue().length !== 0;
  }

  private rebuildTreeForData(data: TreeModel[]) {
    this.dataSource.data = data;
    this.expandNodes(this.treeControl.dataNodes);
    this.clearCaches();
    this.updateCaches();
  }

  private expandNodes(flatNodes: FlatTreeModel[]) {
    if (!flatNodes || flatNodes.length === 0) { return; }
    return flatNodes.forEach((node) => {
      if (node.expandable && node.expanded) {
        this.treeControl.expand(node);
      }
    });
  }

  private clearCaches() {
    this.checkedMap.clear();
    this.indeterminateMap.clear();
    this.nodesMap.clear();
  }

  private updateCaches() {
    this.treeControl.dataNodes.forEach(node => {
      this.nodesMap.set(node.id, node);
      if (FlatTreeHelper.isExpandable(node)) {
        this.checkedMap.set(node.id, this.descendantsAllSelected(node));
        this.indeterminateMap.set(node.id, this.descendantsPartiallySelected(node));
      }
    });
  }

  private getCheckedState(node: FlatTreeModel): boolean {
    if (FlatTreeHelper.isExpandable(node)) {
      return this.descendantsAllSelected(node);
    }
    return node.checked;
  }

  public descendantsAllSelected(node: FlatTreeModel): boolean {
    const descendants = this.treeControl.getDescendants(node);
    if (descendants.length === 0) {
      return false;
    }
    return descendants.every(child => this.getCheckedState(child));
  }

  public descendantsPartiallySelected(node: FlatTreeModel): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const someChecked = descendants.some(child => this.getCheckedState(child));
    return someChecked && !this.checkedMap.get(node.id);
  }

  public isIndeterminate(node: FlatTreeModel) {
    return this.indeterminateMap.get(node.id);
  }

  public isChecked(node: FlatTreeModel) {
    return this.checkedMap.get(node.id);
  }

}
