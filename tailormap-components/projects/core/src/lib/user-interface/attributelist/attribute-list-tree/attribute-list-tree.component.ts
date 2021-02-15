import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttributeListState } from '../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { TreeService } from '../../../shared/tree/tree.service';
import { selectAttributeListRelationsTree, selectFeatureDataForTab, selectTab } from '../state/attribute-list.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { loadTotalCountForTab, setSelectedFeatureType } from '../state/attribute-list.actions';

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

  constructor(
    private store$: Store<AttributeListState>,
    private treeService: TreeService,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectFeatureDataForTab, this.layerId)
      .pipe(takeUntil(this.destroyed))
      .subscribe(featureData => {
        const emptyTotalCount = featureData.findIndex(data => data.totalCount === null) !== -1;
        if (emptyTotalCount) {
          this.store$.dispatch(loadTotalCountForTab({ layerId: this.layerId }));
        }
      });
    this.treeService.setDataSource(this.store$.select(selectAttributeListRelationsTree, this.layerId));
    this.treeService.setSelectedNode(
      this.store$.select(selectTab, this.layerId)
        .pipe(
          filter(tab => !!tab),
          map(tab => `${tab.selectedRelatedFeatureType}`),
        ),
    );
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
