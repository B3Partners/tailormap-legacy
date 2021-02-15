import { Injectable } from '@angular/core';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { catchError, map, take } from 'rxjs/operators';
import {
  AttributeListFeature, AttributeListParameters, AttributeListResponse, RelatedFeatureType,
} from '../../../shared/attribute-service/attribute-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { forkJoin, Observable, of } from 'rxjs';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListFilterModel, FilterType } from '../models/attribute-list-filter-models';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributeTypeEnum } from '../../../application/models/attribute-type.enum';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectFormConfigForFeatureType } from '../../../feature-form/state/form.selectors';
import { FormTreeHelpers } from '../../../feature-form/form-tree/form-tree-helpers';

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
export class AttributeListDataService {

  constructor(
    private attributeService: AttributeService,
    private store$: Store<AttributeListState>,
    private applicationService: ApplicationService,
    private metadataService: MetadataService,
  ) {}

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
      .map(featureType => this.getCountForFeatureType$(tab, featureType, tabFeatureData))
    return forkJoin(counts$);
  }

  private getCountForFeatureType$(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadTotalCountResult> {
    return this.metadataService.getTotalFeaturesForQuery$(
      +(tab.layerId),
      this.getFilter(tab, featureType, tabFeatureData),
      featureType,
    ).pipe(map(count => ({ featureType, totalCount: count })));
  }

  public loadDataForFeatureType$(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): Observable<LoadDataResult> {
    const featureTypeData = tabFeatureData.find(data => data.featureType === featureType);
    const attrParams: AttributeListParameters = {
      application: this.applicationService.getId(),
      appLayer: +(tab.layerId),
      featureType,
      filter: this.getFilter(tab, featureType, tabFeatureData),
      limit: featureTypeData.pageSize,
      page: 1,
      start: featureTypeData.pageIndex * featureTypeData.pageSize,
      clearTotalCountCache: true,
      dir: featureTypeData.sortDirection,
      sort: featureTypeData.sortedColumn || '',
    };
    return forkJoin([
      this.attributeService.features$(attrParams).pipe(
        catchError(e => of<AttributeListResponse>({ success: false, message: '', features: [], total: 0 })),
      ),
      this.store$.select(selectFormConfigForFeatureType, tab.layerName).pipe(take(1)),
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
          }
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
    )
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

  public getFilter(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): string {
    const filters = new Map<number, string>();
    tabFeatureData.forEach(data => {
      const query = data.filter.map(filter => this.getQueryForFilter(filter)).join(' AND ');
      if (query !== '') {
        filters.set(data.featureType, query);
      }
    });
    const isRelatedFeature = tab.featureType !== featureType;
    const mainFeatureData = tabFeatureData.find(data => data.featureType === tab.featureType);
    return this.getQueryForFeatureType(tab, featureType, filters, isRelatedFeature, mainFeatureData);
  }

  private getQueryForFeatureType(
    tab: AttributeListTabModel,
    featureType: number,
    filters: Map<number, string>,
    isRelatedFeature: boolean,
    mainFeatureData: AttributeListFeatureTypeData,
  ) {
    const featureFilter: string[] = tab.relatedFeatures.map<string>(relation => {
      if (relation.foreignFeatureType === featureType) {
        return '';
      }
      const relationFilter = filters.get(relation.foreignFeatureType);
      if (relationFilter) {
        const filter = `RELATED_FEATURE(${tab.featureType},${relation.foreignFeatureType},(${relationFilter}))`;
        if (isRelatedFeature) {
          return `RELATED_FEATURE(${featureType},${tab.featureType},(${filter}))`;
        }
        return filter;
      }
      return '';
    });
    if (filters.has(featureType)) {
      featureFilter.push(filters.get(featureType));
    }
    if (isRelatedFeature && filters.has(tab.featureType)) {
      featureFilter.push(`RELATED_FEATURE(${featureType},${tab.featureType},(${filters.get(tab.featureType)}))`);
    }
    if (isRelatedFeature && mainFeatureData.checkedFeatures.length > 0) {
      const checkedRowsFilter = this.getQueryForCheckedRows(tab, featureType, mainFeatureData);
      if (checkedRowsFilter) {
        featureFilter.push(checkedRowsFilter);
      }
    }
    return featureFilter.filter(f => !!f).join(' AND ');
  }

  private getQueryForCheckedRows(
    tab: AttributeListTabModel,
    featureType: number,
    mainFeatureData: AttributeListFeatureTypeData,
  ) {
    const currentRelation = tab.relatedFeatures.find(r => r.foreignFeatureType === featureType);
    const selectedRowsFilter = [];
    if (currentRelation) {
      currentRelation.relationKeys.forEach(relation => {
        const checkedFeatureKeys = new Set<string>();
        mainFeatureData.checkedFeatures.forEach(checkedFeature => {
          if (checkedFeature[relation.leftSideName]) {
            checkedFeatureKeys.add(AttributeTypeHelper.getExpression(`${checkedFeature[relation.leftSideName]}`, AttributeTypeEnum.STRING));
          }
        });
        if (checkedFeatureKeys.size !== 0) {
          selectedRowsFilter.push(`${relation.rightSideName} IN (${Array.from(checkedFeatureKeys).join(',')})`);
        }
      });
    }
    if (selectedRowsFilter.length === 0) {
      return '';
    }
    return `(${selectedRowsFilter.join(' AND ')})`;
  }

  private getQueryForFilter(filter: AttributeListFilterModel): string {
    if (filter.type === FilterType.NOT_LIKE) {
      return `${filter.name} NOT ILIKE ${this.buildValueFilterString(filter.type, filter.value)}`;
    }
    if (filter.type === FilterType.UNIQUE_VALUES) {
      return `${filter.name} IN (${this.buildValueFilterString(filter.type, filter.value)})`;
    }
    return `${filter.name} ILIKE ${this.buildValueFilterString(filter.type, filter.value)}`;
  }

  private buildValueFilterString(type: FilterType, values: string[]): string {
    if (values.length === 1) {
      if (type === FilterType.LIKE || type === FilterType.NOT_LIKE) {
        return AttributeTypeHelper.getExpression(`%${values[0]}%`, AttributeTypeEnum.STRING);
      }
      return AttributeTypeHelper.getExpression(`${values[0]}`, AttributeTypeEnum.STRING);
    }
    return values.map(value => AttributeTypeHelper.getExpression(`${value}`, AttributeTypeEnum.STRING)).join(',');
  }

}
