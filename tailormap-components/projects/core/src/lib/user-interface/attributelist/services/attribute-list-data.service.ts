import { Injectable, OnDestroy } from '@angular/core';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { catchError, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import {
  AttributeListFeature, AttributeListParameters, AttributeListResponse, RelatedFeatureType,
} from '../../../shared/attribute-service/attribute-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { MetadataService } from '../../../application/services/metadata.service';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectFormConfigForFeatureTypeName } from '../../../application/state/application.selectors';
import { FormTreeHelpers } from '../../../feature-form/form-tree/form-tree-helpers';
import { AttributeListFilterHelper } from '../helpers/attribute-list-filter.helper';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { selectAttributeListTabDictionary } from '../state/attribute-list.selectors';
import { externalFilterChanged } from '../state/attribute-list.actions';

export interface LoadDataResult {
  layerId: string;
  featureType: number;
  errorMessage?: string;
  totalCount: number;
  rows: AttributeListRowModel[];
  relatedFeatures: RelatedFeatureType[];
}

export interface LoadTotalCountResult {
  featureType: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttributeListDataService implements OnDestroy {

  private destroyed = new Subject();

  constructor(
    private attributeService: AttributeService,
    private store$: Store<AttributeListState>,
    private applicationService: ApplicationService,
    private metadataService: MetadataService,
    private tailorMapService: TailorMapService,
  ) {
    this.tailorMapService.layerFilterChangedChanged$
      .pipe(
        takeUntil(this.destroyed),
        withLatestFrom(this.store$.select(selectAttributeListTabDictionary)),
      )
      .subscribe(([ layerFilterChanged, tabsDictionary ]) => {
        const layerId = `${layerFilterChanged.appLayer.id}`;
        if (tabsDictionary.has(layerId)) {
          this.store$.dispatch(externalFilterChanged({ layerId }));
        }
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public loadData$(
    tab: AttributeListTabModel,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadDataResult> {
      return this.loadDataForFeatureType$(tab, tab.selectedRelatedFeatureType, tabFeatureData);
  }

  public loadTotalCount$(
    tab: AttributeListTabModel,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadTotalCountResult[]> {
    const counts$ = [ tab.featureType, ...tabFeatureData.map(data => data.featureType) ]
      .map(featureType => this.getCountForFeatureType$(tab, featureType, tabFeatureData));
    return forkJoin(counts$);
  }

  private getCountForFeatureType$(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadTotalCountResult> {
    return this.metadataService.getTotalFeaturesForQuery$(
      +(tab.layerId),
      AttributeListFilterHelper.getFilter(tab, featureType, tabFeatureData, this.getExtraFiltersForTab(tab)),
      featureType,
    ).pipe(map(count => ({ featureType, totalCount: count })));
  }

  public loadDataForFeatureType$(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadDataResult> {
    const featureTypeData = tabFeatureData.find(data => data.featureType === featureType && data.layerId === tab.layerId);
    const attrParams: AttributeListParameters = {
      application: this.applicationService.getId(),
      appLayer: +(tab.layerId),
      featureType,
      filter: AttributeListFilterHelper.getFilter(tab, featureType, tabFeatureData, this.getExtraFiltersForTab(tab)),
      limit: featureTypeData.pageSize,
      page: 1,
      start: featureTypeData.pageIndex * featureTypeData.pageSize,
      clearTotalCountCache: true,
      dir: featureTypeData.sortDirection,
      sort: featureTypeData.sortedColumn || '',
    };
    return forkJoin([
      this.attributeService.features$(attrParams).pipe(
        catchError(() => of<AttributeListResponse>({ success: false, message: '', features: [], total: 0 })),
      ),
      this.store$.select(selectFormConfigForFeatureTypeName, tab.layerName).pipe(take(1)),
    ]).pipe(
      map(([ response, formConfig ]): LoadDataResult => {
        if (!response.success) {
          return {
            layerId: tab.layerId,
            featureType: featureTypeData.featureType,
            totalCount: 0,
            rows: [],
            relatedFeatures: [],
            errorMessage: response.message || 'Failed loading attributes',
          };
        }
        const checkedRows = new Set<string>(featureTypeData.checkedFeatures.map(checkedFeature => checkedFeature.rowId));
        return {
          layerId: tab.layerId,
          featureType: featureTypeData.featureType,
          totalCount: response.total,
          rows: this.decorateFeatures(response.features, formConfig, checkedRows),
          relatedFeatures: response.features.length > 0 ? (response.features[0].related_featuretypes || []) : [],
        };
      }),
    );
  }

  private getExtraFiltersForTab(tab: AttributeListTabModel) {
    return this.tailorMapService.getFilterString(+(tab.layerId));
  }

  private decorateFeatures(
    features: AttributeListFeature[],
    formConfig: FormConfiguration,
    checkedRows: Set<string>,
  ): AttributeListRowModel[] {
    return features.map<AttributeListRowModel>(feature => {
      const relatedFeatures = feature.related_featuretypes || [];
      const rowId = `${feature.__fid}`;
      const decoratedFeature: AttributeListRowModel = {
        _checked: checkedRows.has(rowId),
        _expanded: false,
        _selected: false,
        rowId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        related_featuretypes: relatedFeatures,
        ...feature,
      };
      if (formConfig) {
        formConfig.fields.forEach(field => {
          decoratedFeature[field.key] = FormTreeHelpers.getFeatureValueForField(decoratedFeature, formConfig, field.key);
        });
      }
      return decoratedFeature;
    });
  }

}
