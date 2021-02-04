import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AttributeListActions from './attribute-list.actions';
import { concatMap, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { HighlightService } from '../../../shared/highlight-service/highlight.service';
import { Store } from '@ngrx/store';
import { AttributeListState } from './attribute-list.state';
import { selectAttributeListConfig, selectTab } from './attribute-list.selectors';
import { of } from 'rxjs';
import { AttributeListDataService, LoadDataResult } from '../services/attribute-list-data.service';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { TabUpdateHelper } from '../helpers/tab-update.helper';

@Injectable()
export class AttributeListEffects {

  public hideAttributeList$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setAttributeListVisibility),
    filter((action) => !action.visible),
    tap(action => {
      this.highlightService.clearHighlight();
    })), { dispatch: false },
  );

  public changeAttributeListTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setSelectedTab),
    tap(action => {
      this.highlightService.clearHighlight();
    })), { dispatch: false },
  );

  public updateRowSelected$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.updateRowSelected),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectAttributeListConfig)),
    )),
    tap(([ action, attributeListConfig ]) => {
      this.highlightService.highlightFeature(`${action.rowId}`, +(action.layerId), true, attributeListConfig.zoomToBuffer);
    })), { dispatch: false },
  );

  public loadDataForTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.loadDataForTab),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectTab, action.layerId)),
    )),
    concatMap(([ action, tab ]) => this.attributeListDataService.loadData(tab)),
    map((result: LoadDataResult) => {
      const tabChanges: Partial<AttributeListTabModel> = {
        totalCount: result.totalCount,
        rows: result.features,
        relatedFeatures: result.relatedFeatures,
        loadingError: result.errorMessage,
      };
      return AttributeListActions.loadDataForTabSuccess({ layerId: result.layerId, tabChanges });
    }),
  ));

  public updateTabProperties$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.updatePage, AttributeListActions.updateSort),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectTab, action.layerId)),
    )),
    concatMap(([ action, tab ]) => {
      return this.attributeListDataService.loadData(TabUpdateHelper.updateTabForAction(action, tab));
    }),
    tap(() => {
      this.highlightService.clearHighlight();
    }),
    map((result: LoadDataResult) => {
      const tabChanges: Partial<AttributeListTabModel> = {
        rows: result.features,
        loadingError: result.errorMessage,
      };
      return AttributeListActions.loadDataForTabSuccess({ layerId: result.layerId, tabChanges });
    }),
  ));

  constructor(
    private actions$: Actions,
    private store$: Store<AttributeListState>,
    private attributeListDataService: AttributeListDataService,
    private highlightService: HighlightService,
  ) {}

}
