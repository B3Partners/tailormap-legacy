import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserFeatures } from '../util/browser';
import { getEventValue } from '../util/event.helper';
import { NodePositionChangedEventModel } from './models/node-position-changed-event.model';
import { FlatTreeModel } from './models/flat-tree.model';

export const treeNodeBaseClass = 'tree-node-wrapper';

type DragDropEventHandler = (e: DragEvent) => void;
type MouseEventHandler = (e: MouseEvent) => void;

export interface DropZoneOptions {
  dropInsideOnly?: boolean;
  getTargetElement(): HTMLDivElement;
  dropAllowed(nodeid: string): boolean;
  dropInsideAllowed(nodeid: string): boolean;
  isExpandable(nodeid: string): boolean;
  isExpanded(nodeid: string): boolean;
  expandNode(nodeid: string): void;
  getParent(nodeid: string): string | null;
  nodePositionChanged(evt: NodePositionChangedEventModel): void;
}

@Injectable()
export class TreeDragDropService implements OnDestroy {

  public constructor() {
    this.handleDragOverListener = this.handleDragOver.bind(this);
    this.handleDragLeaveListener = this.handleDragLeave.bind(this);
    this.handleDropListener = this.handleDrop.bind(this);
    this.handleDragEndListener = this.handleDragEnd.bind(this);
    this.handleMouseMoveListener = this.handleMouseMove.bind(this);
  }

  private treeDragDropEnabled = new BehaviorSubject<boolean>(!BrowserFeatures.isTouchDevice);
  public treeDragDropEnabled$ = this.treeDragDropEnabled.asObservable();

  private readonly handleDragOverListener: DragDropEventHandler;
  private readonly handleDragLeaveListener: DragDropEventHandler;
  private readonly handleDropListener: DragDropEventHandler;
  private readonly handleDragEndListener: DragDropEventHandler;

  private readonly handleMouseMoveListener: MouseEventHandler;

  private dragNode: FlatTreeModel;
  private dragNodeExpandOverWaitTimeMs = 300;
  private dragOverNodeId: string;
  private dragNodeExpandOverTime: number;
  private dragNodePosition: 'before' | 'after' | 'inside';

  private beforeCls = `${treeNodeBaseClass}--drop-before`;
  private afterCls = `${treeNodeBaseClass}--drop-after`;
  private insideCls = `${treeNodeBaseClass}--drop-inside`;
  private lastOffsetY: number | null = null;

  private dropZones: DropZoneOptions[];

  private static getDragTarget(e: DragEvent): HTMLDivElement | null {
    if (e.target && (e.target as HTMLElement).className && (e.target as HTMLElement).className.indexOf(treeNodeBaseClass) !== -1) {
      return e.target as HTMLDivElement;
    }
    return null;
  }

  private static getNodeId(treeNode: HTMLDivElement): string {
    return treeNode.getAttribute('data-nodeid');
  }

  private static loopNodes(treeElement: HTMLDivElement, callback: (treeNode: HTMLDivElement) => void) {
    const nodes = treeElement.querySelectorAll(`.${treeNodeBaseClass}`);
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      callback(nodes[i] as HTMLDivElement);
    }
  }

  public ngOnDestroy(): void {
    this.handleDragEnd();
  }

  public setDragDropEnabled(enable: boolean) {
    this.treeDragDropEnabled.next(enable);
  }

  public handleDragStart(event: DragEvent, dragNode: FlatTreeModel, dropZones: DropZoneOptions[]) {
    this.dropZones = dropZones;
    this.dragNode = dragNode;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari && event.dataTransfer && event.dataTransfer.setDragImage) {
      // Hides the 'ghost' image while dragging. Safari seems to have a issue so we don't hide it on Safari
      event.dataTransfer.setDragImage(document.createElement('span'), 0, 0);
    }

    this.dragOverNodeId = null;
    this.dragNodeExpandOverTime = 0;
    this.lastOffsetY = null;

    dropZones.forEach(dz => this.initDropZone(dz));
  }

  private initDropZone(dropZone: DropZoneOptions) {
    const treeElement = dropZone.getTargetElement();
    if (!treeElement) {
      return;
    }
    const scrollContainer = treeElement.closest('.tree-wrapper') as HTMLDivElement;
    treeElement.classList.add(`mat-tree--drag-active`);
    scrollContainer.addEventListener('dragover', this.handleMouseMove);

    TreeDragDropService.loopNodes(treeElement, treeNode => {
      treeNode.addEventListener('dragover', this.handleDragOverListener);
      treeNode.addEventListener('dragleave', this.handleDragLeaveListener);
      treeNode.addEventListener('dragend', this.handleDragEndListener);
      treeNode.addEventListener('drop', this.handleDropListener);
    });
  }

  private handleMouseMove = (e: MouseEvent) => {
    const scrollContainer = e.currentTarget as HTMLDivElement;
    const scrollContainerRect = scrollContainer.getBoundingClientRect();
    const offsetY = e.clientY - scrollContainerRect.top;
    const percentageY = offsetY / scrollContainerRect.height;
    if (percentageY <= .2 && scrollContainer.scrollTop !== 0) {
      scrollContainer.scrollTop -= 5;
    } else if (percentageY >= .8
      && Math.ceil(scrollContainer.scrollHeight - scrollContainer.scrollTop) > Math.ceil(scrollContainerRect.height)) {
      scrollContainer.scrollTop += 5;
    }
  }

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    const element = TreeDragDropService.getDragTarget(e);
    if (!element) {
      return;
    }
    const nodeId = TreeDragDropService.getNodeId(element);
    const dropZone = this.dropZones.find(dz => dz.dropAllowed(nodeId));
    if (!dropZone) {
      return;
    }

    if (nodeId !== this.dragOverNodeId) {
      if (this.dragNodeExpandOverTime) {
        window.clearTimeout(this.dragNodeExpandOverTime);
      }
      const shouldExpand = this.dragNode.id !== nodeId && dropZone.isExpandable(nodeId) && !dropZone.isExpanded(nodeId);
      if (shouldExpand) {
        this.dragNodeExpandOverTime = window.setTimeout(() => {
          dropZone.expandNode(nodeId);
        }, this.dragNodeExpandOverWaitTimeMs);
      }

      this.dragOverNodeId = nodeId;
    }

    const clientY = getEventValue<DragEvent>(e, 'clientY');
    const offsetY = clientY - element.getBoundingClientRect().top;
    if (offsetY === this.lastOffsetY) {
      return;
    }
    this.lastOffsetY = offsetY;
    const percentageY = offsetY / element.offsetHeight;
    if (dropZone.dropInsideOnly && dropZone.dropInsideAllowed(nodeId)) {
      this.dragNodePosition = 'inside';
    } else {
      const beforePercentage = dropZone.dropInsideAllowed(nodeId) ? 0.25 : 0.5;
      const afterPercentage = dropZone.dropInsideAllowed(nodeId) ? 0.75 : 0.5;
      if (percentageY < beforePercentage) {
        this.dragNodePosition = 'before';
      } else if (percentageY >= afterPercentage) {
        this.dragNodePosition = 'after';
      } else {
        this.dragNodePosition = 'inside';
      }
    }

    const hasDropBeforeCls = element.classList.contains(this.beforeCls);
    const hasDropAfterCls = element.classList.contains(this.afterCls);
    const hasDropInsideCls = element.classList.contains(this.insideCls);
    const removeCls = [];
    if (hasDropBeforeCls && this.dragNodePosition !== 'before') {
      removeCls.push(this.beforeCls);
    }
    if (hasDropAfterCls && this.dragNodePosition !== 'after') {
      removeCls.push(this.afterCls);
    }
    if (hasDropInsideCls && this.dragNodePosition !== 'inside') {
      removeCls.push(this.insideCls);
    }
    if (!hasDropBeforeCls && this.dragNodePosition === 'before') {
      element.classList.add(this.beforeCls);
    }
    if (!hasDropAfterCls && this.dragNodePosition === 'after') {
      element.classList.add(this.afterCls);
    }
    if (!hasDropInsideCls && this.dragNodePosition === 'inside') {
      element.classList.add(this.insideCls);
    }
    removeCls.forEach(c => element.classList.remove(c));
  }

  private handleDrop = (e) => {
    e.preventDefault();
    const element = TreeDragDropService.getDragTarget(e);
    if (!element) {
      return;
    }
    const nodeId = TreeDragDropService.getNodeId(element);
    const dropZone = this.dropZones.find(dz => dz.dropAllowed(nodeId));
    if (!dropZone) {
      return;
    }
    if (nodeId !== this.dragNode.id) {
      const insideExpandableNode = this.dragNodePosition === 'inside' && dropZone.isExpandable(nodeId);
      const parent = insideExpandableNode ? nodeId : dropZone.getParent(nodeId);
      const prevParent = dropZone.getParent(this.dragNode.id);
      const eventData = {
        nodeId: this.dragNode.id,
        toParent: parent ? parent : null,
        fromParent: prevParent ? prevParent : null,
        position: this.dragNodePosition,
        sibling: nodeId,
      };
      dropZone.nodePositionChanged(eventData);
    }
    this.handleDragEnd();
  }

  private handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    const element = TreeDragDropService.getDragTarget(e);
    if (!element) {
      return;
    }
    element.classList.remove(this.beforeCls);
    element.classList.remove(this.afterCls);
    element.classList.remove(this.insideCls);
  }

  private handleDragEnd = () => {
    if (!this.dropZones) {
      return;
    }
    this.dropZones.forEach(dropZone => {
      const treeElement = dropZone.getTargetElement();
      if (!treeElement) {
        return;
      }
      treeElement.classList.remove(`mat-tree--drag-active`);
      const scrollContainer = treeElement.closest('.tree-wrapper') as HTMLDivElement;
      scrollContainer.removeEventListener('dragover', this.handleMouseMoveListener);
      TreeDragDropService.loopNodes(treeElement, treeNode => {
        treeNode.removeEventListener('dragover', this.handleDragOverListener);
        treeNode.removeEventListener('dragleave', this.handleDragLeaveListener);
        treeNode.removeEventListener('dragend', this.handleDragEndListener);
        treeNode.removeEventListener('drop', this.handleDropListener);
        treeNode.classList.remove(this.beforeCls);
        treeNode.classList.remove(this.afterCls);
        treeNode.classList.remove(this.insideCls);
      });
    });
  }

}
