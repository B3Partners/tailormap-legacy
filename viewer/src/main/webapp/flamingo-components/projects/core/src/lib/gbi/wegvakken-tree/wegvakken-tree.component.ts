import { Component, OnInit, Input } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { Feature, FeatureAttribute, FormConfiguration, FormConfigurations } from '../../shared/wegvakken-models';


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

  @Input()
  public feature: Feature;

  @Input()
  public formConfigs: FormConfigurations;


  constructor() {
    this.dataSource.data = TREE_DATA; 
    console.log("constructor:", this.formConfigs);
  }

  ngOnInit() {
    console.log("ngOnInit:", this.formConfigs);
    this.dataSource.data = [this.convertFeatureToNode(this.feature)];
    this.treeControl.expandAll();
  }


  ngAfterViewInit(): void {
    //this.treeControl.expandAll();
  }


  private convertFeatureToNode(feature: Feature) : FeatureNode{
      const children : FeatureNode[] = [];
      if(feature.children ){
        let fts = {};
        feature.children.forEach((child: Feature) =>{
          const featureType = child.featureType;
          if(!fts.hasOwnProperty(featureType)){
            fts[featureType] = {
              name: featureType,
              children: [],
              id: featureType,
            }
          }
          fts[featureType].children.push(this.convertFeatureToNode(child));
        });
        for(const key in fts) {
          if(fts.hasOwnProperty(key)){
            const child = fts[key];
            children.push(child);

          }
        }
        
      }
      const node :FeatureNode = {
        name: this.getFeatureValue(feature, this.formConfigs.config[feature.featureType].treeNodeColumn),
        children: children,
        id: feature.id,
      };
      return node;
  }

  private getFeatureValue (feature : Feature, key: string): any{
    let val = null;
    feature.attributes.forEach((attr: FeatureAttribute) =>{
        if(attr.key === key){
          val = attr.value;
        }
    });
    return val;
  }
  
  private _transformer = (node: FeatureNode, level: number) :ExampleFlatNode => {
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

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

}
