import { Component, OnInit, Input } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { Feature, FeatureAttribute, FormConfigurations} from '../../shared/wegvakken-models';
import { WegvakkenTreeHelpers } from './wegvakken-tree-helpers';
import { FlatNode, FeatureNode } from './wegvakken-tree-models';

@Component({
  selector: 'flamingo-wegvakken-tree',
  templateUrl: './wegvakken-tree.component.html',
  styleUrls: ['./wegvakken-tree.component.css'],
})
export class WegvakkenTreeComponent implements OnInit {

  constructor() {
  }

  @Input()
  public feature: Feature;

  @Input()
  public formConfigs: FormConfigurations;

  public treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    WegvakkenTreeHelpers.transformer, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public ngOnInit() {
    this.dataSource.data = [this.convertFeatureToNode(this.feature)];
    this.treeControl.expandAll();
  }


  public setNodeSelected(node: FlatNode) {
    console.log("clicked node", node);
    const a = 0;
    }

  private convertFeatureToNode(feature: Feature): FeatureNode {
      const children: FeatureNode[] = [];
      if (feature.children ) {
        const fts = {};
        feature.children.forEach((child: Feature) => {
          const featureType = child.featureType;
          if (!fts.hasOwnProperty(featureType)) {
            fts[featureType] = {
              name: featureType,
              children: [],
              id: featureType,
            };
          }
          fts[featureType].children.push(this.convertFeatureToNode(child));
        });
        for (const key in fts) {
          if (fts.hasOwnProperty(key)) {
            const child = fts[key];
            children.push(child);
          }
        }
      }
      const node: FeatureNode = {
        name: this.getFeatureValue(feature, this.formConfigs.config[feature.featureType].treeNodeColumn),
        children,
        id: feature.id,
      };
      return node;
  }

  private getFeatureValue(feature: Feature, key: string): any {
    let val = null;
    feature.attributes.forEach((attr: FeatureAttribute) => {
        if (attr.key === key) {
          val = attr.value;
        }
    });
    return val;
  }

  public hasChild = (_: number, node: FlatNode) => node.expandable;
}
