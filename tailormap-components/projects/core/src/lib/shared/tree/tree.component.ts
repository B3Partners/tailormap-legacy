import { Component, ElementRef, Input, NgZone, OnDestroy, Optional, TemplateRef, ViewChild } from '@angular/core';
import { CheckStateChange, TreeService } from './tree.service';
import { map } from 'rxjs/operators';
import { FlatTreeHelper } from './helpers/flat-tree.helper';
import { FlatTreeModel } from './models/flat-tree.model';
import { Subscription } from 'rxjs';
import { DropZoneOptions, TreeDragDropService, treeNodeBaseClass } from './tree-drag-drop.service';

@Component({
  selector: 'tailormap-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
})
export class TreeComponent implements OnDestroy {

  @Input()
  public treeNodeTemplate?: TemplateRef<any>;

  @Input()
  public additionalDropZones?: DropZoneOptions[];

  @ViewChild('treeElement', { static: false, read: ElementRef })
  private treeElement: ElementRef<HTMLDivElement>;

  private subscriptions = new Subscription();

  private selectedNodeId: string;

  public treeDragDropServiceEnabled = false;

  public readOnlyMode: boolean;

  private scrollLeft = 0;

  constructor(
    private treeService: TreeService,
    private ngZone: NgZone,
    @Optional() private treeDragDropService: TreeDragDropService,
  ) {
    this.subscriptions.add(this.treeService.selectedNode$.pipe(
      map(selectedNodeId => this.selectedNodeId = selectedNodeId),
    ).subscribe());
    this.subscriptions.add(this.treeService.readonlyMode$.subscribe(readOnlyMode => {
      this.readOnlyMode = readOnlyMode;
      this.treeDragDropServiceEnabled = false;
    }));
    if (treeDragDropService) {
      this.subscriptions.add(this.treeDragDropService.treeDragDropEnabled$.pipe(
        map(enabled => this.treeDragDropServiceEnabled = enabled),
      ).subscribe());
    }
  }

  public getDataSource() {
    return this.treeService.getTreeDataSource();
  }

  public getTreeControl() {
    return this.treeService.getTreeControl();
  }

  public hasChild(idx: number, nodeData: FlatTreeModel) {
    return FlatTreeHelper.isExpandable(nodeData);
  }

  public isExpanded(node: FlatTreeModel) {
    return this.treeService.getTreeControl().isExpanded(node);
  }

  public toggleNodeExpansion(node: FlatTreeModel) {
    this.treeService.nodeExpanded(node.id);
  }

  public toggleGroup(node: FlatTreeModel): void {
    if (this.readOnlyMode) {
      return;
    }
    this.toggleNode(node, this.treeService.getTreeControl().getDescendants(node));
  }

  public toggleLeaf(node: FlatTreeModel): void {
    if (this.readOnlyMode) {
      return;
    }
    this.toggleNode(node);
  }

  public setNodeSelected(node: FlatTreeModel) {
    this.treeService.selectionStateChanged(node.id);
  }

  public getNodeClassName(node: FlatTreeModel) {
    const cls = [
      treeNodeBaseClass,
      FlatTreeHelper.isExpandable(node) ? `${treeNodeBaseClass}--folder` : `${treeNodeBaseClass}--leaf`,
      `${treeNodeBaseClass}--level-${FlatTreeHelper.getLevel(node)}`,
    ];
    if (node.id === this.selectedNodeId) {
      cls.push(`${treeNodeBaseClass}--selected`);
    }
    if (!node.checkbox) {
      cls.push(`${treeNodeBaseClass}--no-checkbox`);
    }
    return cls.join(' ');
  }

  public isIndeterminate(node: FlatTreeModel) {
    return this.treeService.isIndeterminate(node);
  }

  public isChecked(node: FlatTreeModel) {
    return this.treeService.isChecked(node);
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private toggleNode(node: FlatTreeModel, descendants?: FlatTreeModel[]) {
    const stateChange: CheckStateChange = new Map<string, boolean>();
    const checked = descendants ? !this.treeService.descendantsAllSelected(node) : !node.checked;
    stateChange.set(node.id, checked);
    if (descendants) {
      descendants.forEach(d => stateChange.set(d.id, checked));
    }
    this.checkAllParentsSelection(node, stateChange);
    this.treeService.checkStateChanged(stateChange);
  }

  private checkAllParentsSelection(node: FlatTreeModel, stateChange: CheckStateChange): void {
    let parent: FlatTreeModel | null = FlatTreeHelper.getParentNode(node, this.treeService.getDataNodes());
    while (parent !== null) {
      this.checkRootNodeSelection(parent, stateChange);
      parent = FlatTreeHelper.getParentNode(parent, this.treeService.getDataNodes());
    }
  }

  private checkRootNodeSelection(node: FlatTreeModel, stateChange: CheckStateChange): void {
    const descAllSelected = this.treeService.descendantsAllSelected(node);
    if (node.checked && !descAllSelected) {
      stateChange.set(node.id, false);
    } else if (!node.checked && descAllSelected) {
      stateChange.set(node.id, true);
    }
  }

  public handleDragStart(event: DragEvent, node: FlatTreeModel) {
    if (!this.treeDragDropService) {
      return;
    }
    const dropZoneConfig = {
      getTargetElement: () => this.treeElement.nativeElement,
      dropAllowed: (nodeId) => this.treeService.hasNode(nodeId),
      dropInsideAllowed: (nodeId) => this.treeService.isExpandable(nodeId),
      isExpandable: (nodeId) => this.treeService.isExpandable(nodeId),
      isExpanded: (nodeId) => this.treeService.isExpanded(nodeId),
      expandNode: (nodeId) => this.treeService.expandNode(nodeId),
      getParent: (nodeId) => this.treeService.getParent(nodeId),
      nodePositionChanged: evt => this.treeService.nodePositionChanged(evt),
    };
    this.ngZone.runOutsideAngular(() => {
      this.treeDragDropService.handleDragStart(event, node, [ dropZoneConfig, ...(this.additionalDropZones || []) ]);
    });
  }

  public handleTreeScroll(currentTarget: EventTarget) {
    const targetIsHTMLElement = (target: EventTarget): target is HTMLElement => !!(target as HTMLElement).nodeName;
    if (targetIsHTMLElement(currentTarget) && this.scrollLeft !== currentTarget.scrollLeft) {
      this.scrollLeft = currentTarget.scrollLeft;
      currentTarget.style.setProperty('--scroll-pos', this.scrollLeft + 'px');
    }
  }
}
