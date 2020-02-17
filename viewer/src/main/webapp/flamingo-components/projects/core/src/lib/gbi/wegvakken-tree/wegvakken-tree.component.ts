import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class WegvakkenTreeComponent implements OnInit,  OnChanges {

  constructor() {
  }

  @Output()
  public nodeClicked = new EventEmitter<Feature>();

  @Input()
  public features: Feature[];

  @Input()
  public feature: Feature;

  @Input()
  public formConfigs: FormConfigurations;

  public treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    WegvakkenTreeHelpers.transformer, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.convertFeatureToNode(this.features);
    this.treeControl.expandAll();
  }

  public setNodeSelected(node: FlatNode) {
    this.nodeClicked.emit(node.feature);
  }

  private convertFeatureToNode(features: Feature[]): FeatureNode[] {
      const nodes: FeatureNode[] = [];
      features.forEach(feature => {
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
                isFeatureType: true,
              };
            }
            fts[featureType].children.push(this.convertFeatureToNode([child])[0]);
          });
          for (const key in fts) {
            if (fts.hasOwnProperty(key)) {
              const child = fts[key];
              children.push(child);
            }
          }
        }
        nodes.push({
            name: this.getFeatureValue(feature, this.formConfigs.config[feature.featureType].treeNodeColumn),
            children,
            id: feature.id,
            feature,
            selected: feature === this.feature,
            isFeatureType: false,
          });
      });
      return nodes;
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

  public getNodeClassName(node: FlatNode) {
    const treeNodeBaseClass = 'tree-node-wrapper';

    const cls = [
      treeNodeBaseClass,
      node.expandable ? `${treeNodeBaseClass}--folder` : `${treeNodeBaseClass}--leaf`,
      `${treeNodeBaseClass}--level-${node.level}`,
    ];

    if (node.selected) {
      cls.push(`${treeNodeBaseClass}--selected`);
    }

    return cls.join(' ');
  }

  public hasChild = (_: number, node: FlatNode) => node.expandable;
}
