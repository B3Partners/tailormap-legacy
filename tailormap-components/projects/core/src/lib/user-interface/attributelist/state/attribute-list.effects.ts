import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AttributeListActions from './attribute-list.actions';
import { concatMap, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { HighlightService } from '../../../shared/highlight-service/highlight.service';
import { Store } from '@ngrx/store';
import { AttributeListState } from './attribute-list.state';
import {
  selectAttributeListConfig, selectFeatureDataAndRelatedFeatureDataForFeatureType, selectFeatureDataForTab, selectTab,
  selectTabForFeatureType,
} from './attribute-list.selectors';
import { of } from 'rxjs';
import { AttributeListDataService, LoadDataResult } from '../services/attribute-list-data.service';
import { UpdateAttributeListStateHelper } from '../helpers/update-attribute-list-state.helper';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';

@Injectable()
export class AttributeListEffects {

  public hideAttributeList$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setAttributeListVisibility),
    filter((action) => !action.visible),
    tap(() => {
      this.highlightService.clearHighlight();
    })), {dispatch: false},
  );

  public changeAttributeListTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setSelectedTab),
    tap(() => {
      this.highlightService.clearHighlight();
    })), {dispatch: false},
  );

  public updateRowSelected$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.updateRowSelected),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectAttributeListConfig)),
    )),
    tap(([action, attributeListConfig]) => {
      this.highlightService.highlightFeature(`${action.rowId}`, +(action.layerId), true, attributeListConfig.zoomToBuffer);
    })), {dispatch: false},
  );

  public loadDataForTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.loadDataForTab),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTab, action.layerId),
        this.store$.select(selectFeatureDataForTab, action.layerId),
      ),
    )),
    filter(([_action, tab, _featureData]) => {return !!tab; }),
    tap(([action, tab, featureData]) => {
      const mainFilter = this.attributeListDataService.getFilter(tab, tab.featureType, featureData);
      const viewerController = this.tailorMapService.getViewerController();
      const appLayer = viewerController.getAppLayerById(+(action.layerId));
      viewerController.setFilterString(mainFilter, appLayer, 'ngattributelist');
    }),
    concatMap(([action, tab, featureData]) => {
      return this.attributeListDataService.loadData$(tab, featureData).pipe(
        map(result => AttributeListActions.loadDataForTabSuccess({layerId: action.layerId, data: result})),
      );
    }),
  ));

  public updateFeatureDataProperties$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.updatePage, AttributeListActions.updateSort, AttributeListActions.setSelectedFeatureType),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTabForFeatureType, action.featureType),
        this.store$.select(selectFeatureDataAndRelatedFeatureDataForFeatureType, action.featureType),
      ),
    )),
    filter(([_action, tab, _data]) => !!tab),
    concatMap(([action, tab, featureData]) => {
      const updatedFeatureData = featureData.map(data => {
        if (data.featureType === action.featureType) {
          return UpdateAttributeListStateHelper.updateDataForAction(action, data);
        }
        return data;
      });
      const updatedTab = UpdateAttributeListStateHelper.updateTabForAction(action, tab);
      return this.attributeListDataService.loadDataForFeatureType$(updatedTab, tab.selectedRelatedFeatureType, updatedFeatureData);
    }),
    tap(() => {
      this.highlightService.clearHighlight();
    }),
    map((result: LoadDataResult) => {
      return AttributeListActions.loadDataForFeatureTypeSuccess({featureType: result.featureType, data: result});
    }),
  ));

  public loadTotalCountForTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.loadTotalCountForTab),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTab, action.layerId),
        this.store$.select(selectFeatureDataForTab, action.layerId),
      ),
    )),
    concatMap(([action, tab, featureData]) => {
      return this.attributeListDataService.loadTotalCount$(tab, featureData).pipe(
        map(result => AttributeListActions.loadTotalCountForTabSuccess({layerId: action.layerId, counts: result })),
      );
    }),
  ));

  public updateColumnFilter$ = createEffect(() => this.actions$.pipe(
    ofType(
      AttributeListActions.setColumnFilter,
      AttributeListActions.deleteColumnFilter,
      AttributeListActions.clearAllFilters,
      AttributeListActions.clearFilterForFeatureType,
    ),
    concatMap( action => [
      AttributeListActions.loadDataForTab({layerId: action.layerId}),
      AttributeListActions.loadTotalCountForTab({layerId: action.layerId}),
    ]),
  ));

  public clearCountAfterCheckChange$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.toggleCheckedAllRows, AttributeListActions.updateRowChecked),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectFeatureDataAndRelatedFeatureDataForFeatureType, action.featureType),
      ),
    )),
    map(([ action, featureData ]) => {
      const relatedFeatures = featureData.filter(data => data.featureType !== action.featureType);
      return AttributeListActions.clearCountForFeatureTypes({ featureTypes: relatedFeatures.map(data => data.featureType)});
    }),
  ));

  constructor(
    private actions$: Actions,
    private store$: Store<AttributeListState>,
    private attributeListDataService: AttributeListDataService,
    private highlightService: HighlightService,
    private tailorMapService: TailorMapService,
  ) {
  }

}
