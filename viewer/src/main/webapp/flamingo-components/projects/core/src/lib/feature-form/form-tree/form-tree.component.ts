import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';


import { FlatNode, FeatureNode } from './form-tree-models';
import { FormConfiguration, FormConfigurations} from "../form/form-models";
import {Feature} from "../../shared/generated";
import {FormTreeHelpers} from "./form-tree-helpers";

@Component({
  selector: 'flamingo-form-tree',
  templateUrl: './form-tree.component.html',
  styleUrls: ['./form-tree.component.css'],
})
export class FormTreeComponent implements OnInit,  OnChanges {

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
    FormTreeHelpers.transformer, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = this.convertFeatureToNode(this.features);
    console.log("changes in tree", this.features);
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
            const featureType = child.clazz;
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
            name: this.getNodeLabel(feature),
            children,
            object_guid: feature.object_guid,
            feature,
            selected: feature.object_guid === this.feature.object_guid,
            isFeatureType: false,
          });
      });
      return nodes;
  }

  private getNodeLabel (feature:Feature) :string{
    const config : FormConfiguration = this.formConfigs.config[feature.clazz];
    let label = this.getFeatureValue(feature, config.treeNodeColumn);
    if(config.idInTreeNodeColumn){
      let id = feature.object_guid;

      label = (label ? label : config.name) + ' (id: ' + id + ')';
    }
    return label;
  }

  private getFeatureValue(feature: Feature, key: string): any {
    let val = feature[key];
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
