import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatNode } from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormTreeHelpers } from './form-tree-helpers';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { FormCreatorHelpers } from '../form-creator/form-creator-helpers';

@Component({
  selector: 'tailormap-form-tree',
  templateUrl: './form-tree.component.html',
  styleUrls: ['./form-tree.component.css'],
})
export class FormTreeComponent implements OnInit, OnChanges {

  constructor(
    private store$: Store<FormState>,
    private formConfigRepo: FormconfigRepositoryService) {
  }

  @Input()
  public features: Feature[];

  @Input()
  public isCopy = false;

  @Input()
  public feature: Feature;

  @Input()
  public featuresToCopy = [];

  @Input()
  public isBulk = false;

  public treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    FormTreeHelpers.transformer, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = FormTreeHelpers.convertFeatureToNode(this.features, this.formConfigRepo, this.feature.objectGuid);
    this.treeControl.expand(this.treeControl.dataNodes[0]);
  }

  public setNodeSelected(node: FlatNode) {
    this.store$.dispatch(FormActions.setFeature({feature: node.feature}));
  }

  public isFeatureForCopyChecked(featureId: number): boolean {
    const isIn = false;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.featuresToCopy.length; i++) {
      if (featureId === this.featuresToCopy[i]) {
        return true;
      }
    }
    return isIn;
  }

  public addFeatureForCopy(event: any, featureId: number) {
    if (event.checked) {
      this.featuresToCopy.push(featureId);
    }
     else {
      for (let i = 0; i < this.featuresToCopy.length; i++) {
        if (featureId === this.featuresToCopy[i]) {
          this.featuresToCopy.splice(i, 1);
        }
      }
    }

  }

  public getNodeClassName(node: FlatNode) {
    const treeNodeBaseClass = 'tree-node-wrapper';

    const cls = [
      treeNodeBaseClass,
      node.expandable ? `${treeNodeBaseClass}--folder` : `${treeNodeBaseClass}--leaf`,
      `${treeNodeBaseClass}--level-${node.level}`,
    ];

    if (node.selected && !this.isBulk) {
      cls.push(`${treeNodeBaseClass}--selected`);
    }

    return cls.join(' ');
  }

  public hasChild = (_: number, node: FlatNode) => node.expandable;
}
