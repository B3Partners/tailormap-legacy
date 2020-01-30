import { Component, OnInit } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';


interface FeatureNode {
  name: string;
  children?: FeatureNode[];
  id: string;
}

const TREE_DATA: FeatureNode[] = [
  {
    id: '0',
    name: 'Wegvakonderdeel',
    children:[
      {
        id: '1',
        name: 'Inspecties',
        children: [
          {name: 'Nieuwe inspectie', id: '2'},
          {name: 'Inspectie 1', id: '3'},
          {name: 'Inspectie 2', id: '4'},
          {name: 'Inspectie 3', id: '5'},
        ]
      }, {
        id: '6',
        name: 'Planning',
        children: [

          {name: 'Nieuwe planning', id: '7'},
          {name: 'Planning 1', id: '8'},
          {name: 'Planning 2', id: '9'},
          {name: 'Planning 3', id: '10'}
        ]
      }
    ],
  }
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
  selector: 'flamingo-wegvakken-tree',
  templateUrl: './wegvakken-tree.component.html',
  styleUrls: ['./wegvakken-tree.component.css']
})
export class WegvakkenTreeComponent implements OnInit {
  private _transformer = (node: FeatureNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA; }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.treeControl.expandAll();
  }
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

}
