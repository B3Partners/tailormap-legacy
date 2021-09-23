import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormTreeMetadata } from './form-tree-models';
import { Feature } from '../../shared/generated';
import { FormTreeHelpers } from './form-tree-helpers';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import * as FormActions from '../state/form.actions';
import { selectParentCopyFeature, selectFeatures, selectCopyFormOptionsOpen, selectTreeVisible } from '../state/form.selectors';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TreeService, TreeModel, TransientTreeHelper } from '@tailormap/shared';
import { selectFormConfigs } from '../../application/state/application.selectors';

@Component({
  providers: [TreeService],
  selector: 'tailormap-form-tree',
  templateUrl: './form-tree.component.html',
  styleUrls: ['./form-tree.component.css'],
})
export class FormTreeComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();

  @Input()
  public isCopy = false;

  @Input()
  public hidden = false;

  private selectedFeature: Feature;

  public treeOpen$: Observable<boolean>;
  public treeClosed$: Observable<boolean>;

  @Input()
  public set feature (feature: Feature) {
    if (feature && this.transientTreeHelper) {
      this.transientTreeHelper.selectNode(feature.fid);
    }
    this.selectedFeature = feature;
  }

  @Output()
  public relatedFeatureChecked: EventEmitter<Map<string, boolean>> = new EventEmitter();

  @Input()
  public featuresToCopy = [];

  @Input()
  public hasCheckboxes = false;

  @Input()
  public isBulk = false;
  private transientTreeHelper: TransientTreeHelper<FormTreeMetadata>;

  constructor(
    private store$: Store<FormState>,
    private treeService: TreeService,
  ) {
    this.treeService.selectionStateChangedSource$.pipe(
      takeUntil(this.destroyed),
      filter(() => !this.isBulk),
      map(nodeId => this.treeService.getNode(nodeId)),
      filter(node => !node.metadata.isFeatureType),
    ).subscribe(node => {
      if (this.isCopy) {
        this.store$.dispatch(FormActions.setCopySelectedFeature({ feature: node.metadata.feature }));
      } else {
        this.store$.dispatch(FormActions.setFeature({feature: node.metadata.feature}));
      }
    });
  }

  public ngOnInit() {
    this.transientTreeHelper = new TransientTreeHelper(
      this.treeService,
      true,
      node => {
        return !node.metadata.isFeatureType && this.selectedFeature.fid === node.metadata.fid;
      },
      this.hasCheckboxes,
      node => {
        return node.metadata.isFeatureType;
      },
    );

    this.treeOpen$ = this.isCopy ? this.store$.select(selectCopyFormOptionsOpen) : this.store$.select(selectTreeVisible);
    this.treeClosed$ = this.treeOpen$.pipe(map(open => !open));

    const selectFeatures$ = this.isCopy
      ? this.store$.select(selectParentCopyFeature).pipe(map(feature => [feature]))
      : this.store$.select(selectFeatures);
    combineLatest([
      selectFeatures$,
      this.store$.select(selectFormConfigs),
    ])
      .pipe(
        takeUntil(this.destroyed),
        filter(([ features, formConfigs]) => !!features[0] && features.length > 0 && !!formConfigs),
      )
      .subscribe(([ features, formConfigs]) => {
        const tree: TreeModel<FormTreeMetadata> [] = FormTreeHelpers.convertFeatureToTreeModel(features, formConfigs);
        this.transientTreeHelper.createTree(tree);
        if (this.selectedFeature) {
          this.transientTreeHelper.selectNode(this.selectedFeature.fid);
        }
      });

    this.treeService.checkStateChangedSource$.pipe(takeUntil(this.destroyed)).subscribe( event => {
      const relIds = new Map<string, boolean>();
      event.forEach((checked, id) => {
        const node = this.treeService.getNode(id);
        if (node.metadata.feature) {
          relIds.set(node.metadata.feature.fid, checked);
        }
      });
      this.relatedFeatureChecked.emit(relIds);
    });
  }

  public ngOnDestroy() {
    this.transientTreeHelper.destroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  public closeTree() {
    const action = this.isCopy
      ? FormActions.setCopyOptionsOpen({ open: false })
      : FormActions.setTreeOpen({treeOpen: false});
    this.store$.dispatch(action);
  }

  public openTree() {
    const action = this.isCopy
      ? FormActions.setCopyOptionsOpen({ open: true })
      : FormActions.setTreeOpen({treeOpen: true});
    this.store$.dispatch(action);
  }

}
