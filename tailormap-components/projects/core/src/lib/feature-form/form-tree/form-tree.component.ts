import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FeatureNode, FormTreeMetadata } from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormTreeHelpers } from './form-tree-helpers';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { selectFormConfigs, selectTreeOpen } from '../state/form.selectors';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TreeService } from '../../shared/tree/tree.service';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { TransientTreeHelper } from '../../shared/tree/helpers/transient-tree.helper';

@Component({
  selector: 'tailormap-form-tree',
  templateUrl: './form-tree.component.html',
  styleUrls: ['./form-tree.component.css'],
})
export class FormTreeComponent implements OnInit, OnChanges, OnDestroy {
  public isOpen$: Observable<boolean>;

  private destroyed = new Subject();

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

  private transientTreeHelper: TransientTreeHelper<FeatureNode>;

  constructor(
    private store$: Store<FormState>,
    private treeService: TreeService,
    private formConfigRepo: FormconfigRepositoryService) {
    this.treeService.selectionStateChangedSource$.pipe(
      takeUntil(this.destroyed),
      map(nodeId => this.treeService.getNode(nodeId)),
      filter(node => !node.metadata.isFeatureType),
    ).subscribe(node => {
      this.store$.dispatch(FormActions.setFeature({feature: node.metadata.feature}));
    });
  }

  public ngOnInit() {
    this.isOpen$ = this.store$.select(selectTreeOpen);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.store$.select(selectFormConfigs).pipe(takeUntil(this.destroyed)).subscribe(formConfigs => {
      const tree : TreeModel<FormTreeMetadata> [] = FormTreeHelpers.convertFeatureToTreeModel(this.features, this.formConfigRepo,
                                                                  this.feature.objectGuid, formConfigs);
      this.createTree(tree);
    });
  }

  private createTree(tree: TreeModel<FormTreeMetadata>[]) {
    this.transientTreeHelper = new TransientTreeHelper(
      this.treeService,
      tree,
      true,
      node => {
        return !node.metadata.isFeatureType && this.feature.objectGuid === node.metadata.objectGuid;
      },
    );
  }

  public closePanel() {
    this.store$.dispatch(FormActions.setTreeOpen({treeOpen: false}));
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

}
