import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttributeListState } from '../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { TreeService } from '../../../shared/tree/tree.service';
import { selectAttributeListRelationsTree, selectFeatureDataForTab, selectTab } from '../state/attribute-list.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { loadTotalCountForTab, setSelectedFeatureType } from '../state/attribute-list.actions';
import { TransientTreeHelper } from '../../../shared/tree/helpers/transient-tree.helper';
import { TreeModel } from '../../../shared/tree/models/tree.model';

@Component({
  selector: 'tailormap-attribute-list-tree',
  templateUrl: './attribute-list-tree.component.html',
  styleUrls: ['./attribute-list-tree.component.css'],
  providers: [ TreeService ],
})
export class AttributeListTreeComponent implements OnInit, OnDestroy {

  @Input()
  public layerId: string;

  private destroyed = new Subject();
  private transientTreeHelper: TransientTreeHelper<TreeModel>;

  constructor(
    private store$: Store<AttributeListState>,
    private treeService: TreeService,
  ) { }

  public ngOnInit(): void {
    this.transientTreeHelper = new TransientTreeHelper(this.treeService, true, null, false);

    this.store$.select(selectFeatureDataForTab, this.layerId)
      .pipe(takeUntil(this.destroyed))
      .subscribe(featureData => {
        const emptyTotalCount = featureData.findIndex(data => data.totalCount === null) !== -1;
        if (emptyTotalCount) {
          this.store$.dispatch(loadTotalCountForTab({ layerId: this.layerId }));
        }
      });

    this.store$.select(selectAttributeListRelationsTree, this.layerId)
      .pipe(takeUntil(this.destroyed))
      .subscribe(tree => this.transientTreeHelper.createTree(tree));

    this.store$.select(selectTab, this.layerId)
      .pipe(
        takeUntil(this.destroyed),
        filter(tab => !!tab),
        map(tab => `${tab.selectedRelatedFeatureType}`),
      )
      .subscribe(selectedNode => {
        this.transientTreeHelper.selectNode(selectedNode);
      });

    this.treeService.selectionStateChangedSource$
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedFeatureType => {
        this.store$.dispatch(setSelectedFeatureType({ layerId: this.layerId, featureType: +(selectedFeatureType) }));
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
