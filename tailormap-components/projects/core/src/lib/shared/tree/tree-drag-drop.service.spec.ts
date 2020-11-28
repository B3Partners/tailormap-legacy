import { TreeDragDropService } from './tree-drag-drop.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatTreeModel } from './models/flat-tree.model';
import { fakeAsync, tick } from '@angular/core/testing';
import { createEvent } from '../test-helpers/event.helper';

describe('Tree Drag Drop Service', () => {

  const service = new TreeDragDropService();

  const createTreeNode = (id: number) => {
    const node = document.createElement('div');
    node.className = 'tree-node-wrapper';
    node.style.height = '10px';
    node.style.top = ((id - 1) * 10) + 'px';
    node.setAttribute('data-nodeid', 'node-' + id);
    return node;
  };

  const createNodes = (id: number): FlatTreeModel => {
    return {
      id: 'node-' + id,
      checkbox: true,
      checked: true,
      expandable: false,
      expanded: false,
      label: 'Item ' + id,
      level: 0,
    };
  };

  const treeEl = document.createElement('div');
  const treeWrapper = document.createElement('div');
  treeWrapper.className = 'tree-wrapper';
  treeWrapper.style.height = '50px';
  treeWrapper.appendChild(treeEl);
  const treeNode1 = createTreeNode(1);
  treeEl.appendChild(treeNode1);
  const treeNode2 = createTreeNode(2);
  treeEl.appendChild(treeNode2);
  const treeNode3 = createTreeNode(3);
  treeEl.appendChild(treeNode3);
  const treeNode4 = createTreeNode(4);
  treeEl.appendChild(treeNode4);
  const treeControl = new FlatTreeControl<FlatTreeModel>(() => 0, () => false);
  treeControl.dataNodes = [
    createNodes(1),
    createNodes(2),
    createNodes(3),
    createNodes(4),
  ];

  it ('handles drag drop', fakeAsync(() => {
    const positionChangedFn = jasmine.createSpy('nodePositionChanged');
    const dragStartEvent = createEvent<DragEvent, DragEventInit>(DragEvent, 'DragEvent', 'dragstart');
    service.handleDragStart(dragStartEvent, treeControl.dataNodes[0], [{
      getTargetElement(): HTMLDivElement {
        return treeEl;
      },
      dropInsideAllowed(nodeid: string): boolean {
        return false;
      },
      expandNode(nodeid: string) {
        return null;
      },
      dropAllowed(nodeid: string): boolean {
        return treeControl.dataNodes.findIndex(d => d.id === nodeid) !== -1;
      },
      getParent(nodeid: string): string | null {
        return null;
      },
      isExpandable(nodeid: string): boolean {
        return false;
      },
      isExpanded(nodeid: string): boolean {
        return false;
      },
      nodePositionChanged: positionChangedFn,
    }]);
    tick(10);
    treeWrapper.dispatchEvent(createEvent<DragEvent, DragEventInit>(DragEvent, 'DragEvent', 'dragover', {
      clientY: 0,
    }));
    expect(treeEl.classList).toContain('mat-tree--drag-active');
    treeNode2.dispatchEvent(createEvent<DragEvent, DragEventInit>(DragEvent, 'DragEvent', 'dragover', {
      clientY: 0,
    }));
    treeNode2.dispatchEvent(createEvent<DragEvent>(DragEvent, 'DragEvent', 'dragleave'));
    treeNode3.dispatchEvent(createEvent<DragEvent, DragEventInit>(DragEvent, 'DragEvent', 'dragover', {
      clientY: 20,
    }));
    treeNode3.dispatchEvent(createEvent<DragEvent>(DragEvent, 'DragEvent', 'drop'));
    expect(positionChangedFn.calls.count()).toEqual(1);
    expect(positionChangedFn.calls.mostRecent().args).toEqual([
      {
        nodeId: 'node-1',
        toParent: null,
        fromParent: null,
        position: 'after',
        sibling: 'node-3',
      }
    ]);
    expect(treeEl.classList).not.toContain('mat-tree--drag-active');
  }));

});
