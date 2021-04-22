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
import { forkJoin, Observable, of } from 'rxjs';
import { AttributeListDataService, LoadDataResult } from '../services/attribute-list-data.service';
import { UpdateAttributeListStateHelper } from '../helpers/update-attribute-list-state.helper';
import { TailorMapFilters, TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { AttributeListFilterHelper } from '../helpers/attribute-list-filter.helper';
import * as ApplicationActions from '../../../application/state/application.actions';

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
      const mainFilter = AttributeListFilterHelper.getFilter(tab, tab.featureType, featureData);
      this.tailorMapService.setFilterString(mainFilter, +(action.layerId), TailorMapFilters.ATTRIBUTE_LIST);
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
      return AttributeListActions.loadDataForFeatureTypeSuccess({layerId: result.layerId, featureType: result.featureType, data: result});
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

  public updateFilter$ = createEffect(() => this.actions$.pipe(
    ofType(
      AttributeListActions.setColumnFilter,
      AttributeListActions.deleteColumnFilter,
      AttributeListActions.clearAllFilters,
      AttributeListActions.clearFilterForFeatureType,
      AttributeListActions.externalFilterChanged,
    ),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTab, action.layerId),
      ),
    )),
    concatMap( ([ action, tab ]) => [
      AttributeListActions.loadDataForTab({layerId: action.layerId}),
      AttributeListActions.loadTotalCountForTab({layerId: action.layerId}),
      AttributeListActions.refreshStatisticsForTab({layerId: action.layerId, featureType: tab.selectedRelatedFeatureType || tab.featureType }),
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

  public loadStatistics$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.loadStatisticsForColumn),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTabForFeatureType, action.featureType),
        this.store$.select(selectFeatureDataAndRelatedFeatureDataForFeatureType, action.featureType),
      ),
    )),
    concatMap(([ action, tab, tabFeatureData ]) => {
      return this.statisticsService.statisticValue$({
        appLayer: +(action.layerId),
        application: this.tailorMapService.getApplicationId(),
        column: action.column,
        featureType: action.featureType,
        type: action.statisticType,
        filter: AttributeListFilterHelper.getFilter(tab, action.featureType, tabFeatureData, this.tailorMapService.getFilterString(+(tab.layerId))),
      }).pipe(map(result => {
        return AttributeListActions.statisticsForColumnLoaded({
          column: action.column,
          featureType: action.featureType,
          layerId: action.layerId,
          value: result.result,
        });
      }));
    }),
  ));

  public refreshStatistics$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.refreshStatisticsForTab),
    concatMap(action => of(action).pipe(
      withLatestFrom(
        this.store$.select(selectTabForFeatureType, action.featureType),
        this.store$.select(selectFeatureDataAndRelatedFeatureDataForFeatureType, action.featureType),
      ),
    )),
    concatMap(([ action, tab, tabFeatureData ]) => {
      const featureData = tabFeatureData.find(data => data.featureType === action.featureType);
      const statQueries$: Array<Observable<{ value: number; column: string }>> = featureData.statistics.map(s => this.statisticsService.statisticValue$({
        appLayer: +(action.layerId),
        application: this.tailorMapService.getApplicationId(),
        column: s.name,
        featureType: action.featureType,
        type: s.statisticType,
        filter: AttributeListFilterHelper.getFilter(tab, action.featureType, tabFeatureData, this.tailorMapService.getFilterString(+(tab.layerId))),
      }).pipe(map(result => ({ value: result.result, column: s.name }))));
      return forkJoin([ of(action), forkJoin(statQueries$) ]);
    }),
    map(([ action, results ]) => {
      return AttributeListActions.statisticsForTabRefreshed({
        layerId: action.layerId,
        featureType: action.featureType,
        results,
      });
    }),
  ));

  public editFeaturesComplete$ = createEffect(() => this.actions$.pipe(
    ofType(ApplicationActions.editFeaturesComplete),
    map(action => AttributeListActions.loadDataForTab({ layerId: action.layerId })),
  ));

  constructor(
    private actions$: Actions,
    private store$: Store<AttributeListState>,
    private attributeListDataService: AttributeListDataService,
    private highlightService: HighlightService,
    private tailorMapService: TailorMapService,
    private statisticsService: StatisticService,
  ) {
  }

}
