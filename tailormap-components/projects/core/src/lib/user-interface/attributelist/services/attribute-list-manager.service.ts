import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectVisibleLayers } from '../../../application/state/application.selectors';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { selectAttributeListTabs } from '../state/attribute-list.selectors';
import { changeAttributeListTabs } from '../state/attribute-list.actions';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { TailormapAppLayer } from '../../../application/models/tailormap-app-layer.model';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';

@Injectable({
  providedIn: 'root',
})
export class AttributeListManagerService implements OnDestroy {

  private destroyed = new Subject();

  constructor(
    private store$: Store<AttributeListState>,
  ) {
    this.store$.select(selectVisibleLayers)
      .pipe(
        takeUntil(this.destroyed),
        withLatestFrom(this.store$.select(selectAttributeListTabs)),
      )
      .subscribe(([ layers, tabs ]) => {
        const newTabs: AttributeListTabModel[] = layers
          .filter(layer => tabs.findIndex(t => t.layerId === layer.id) === -1)
          .map<AttributeListTabModel>(layer => this.createTabFromLayer(layer));
        const removedTabs: string[] = tabs
          .filter(tab => layers.findIndex(l => l.id === tab.layerId) === -1)
          .map<string>(tab => tab.layerId);
        this.store$.dispatch(changeAttributeListTabs({ newTabs, removedTabs }));
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private createTabFromLayer(layer: TailormapAppLayer): AttributeListTabModel {
    return {
      layerId: layer.id,
      layerAlias: layer.alias,
      layerName: LayerUtils.sanitizeLayername(layer.layerName),
      columns: [],
      relatedFeatures: [],
      filter: [],
      rows: [],
      pageIndex: 0,
      pageSize: 10,
      totalCount: 0,
      sortDirection: 'ASC',
    };
  }

}
