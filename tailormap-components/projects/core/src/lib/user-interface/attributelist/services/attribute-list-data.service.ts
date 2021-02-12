import { Injectable } from '@angular/core';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { catchError, map, take } from 'rxjs/operators';
import {
  AttributeListFeature, AttributeListParameters, AttributeListResponse, RelatedFeatureType,
} from '../../../shared/attribute-service/attribute-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { forkJoin, Observable, of } from 'rxjs';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { MetadataService } from '../../../application/services/metadata.service';
import { FilterType } from '../models/attribute-list-filter-models';

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
    private formConfigRepoService: FormconfigRepositoryService,
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
      this.formConfigRepoService.getFormConfigForLayer$(tab.layerName).pipe(take(1)),
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
        const checkedRows = new Set<string>(featureTypeData.checkedFeatures);
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
          decoratedFeature[field.key] = this.formConfigRepoService.getFeatureValueForField(decoratedFeature, field.key, formConfig);
        });
      }
      return decoratedFeature;
    });
  }

  private getFilter(
    tab: AttributeListTabModel,
    featureType: number,
    tabFeatureData: AttributeListFeatureTypeData[],
  ): string {
    // @TODO: implement
    const featureData = tabFeatureData.find(t => t.featureType === featureType);
    let finalFilter = '';
    featureData.filter.forEach((filter) => {
      if  (filter.value) {
        finalFilter += '(' + filter.name + ' ' + this.getFilterMethod(filter.type) + '( ' + this.buildValueFilterString(filter.value) + ')) AND';
      }
    });
    finalFilter = finalFilter.slice(0, -4);
    return finalFilter;
  }

  private buildValueFilterString(values: string[]): string {
    let valueFilterString = '';
    values.forEach(value => {
      value = value.replace('\'', '&quot;');
      valueFilterString += '\'' + value + '\',';
    })
    return valueFilterString.slice(0, -1);
  }

  private getFilterMethod(type: string): string {
    let filterType = '';
    if (type === FilterType.LIKE || type === FilterType.UNIQUE_VALUES) {
      filterType = 'IN';
    } else {
      filterType = 'NOT IN';
    }
    return filterType;
  }

  // private getFilterForFeature(featureData: AttributeListFeatureTypeData) {
  //   return featureData.filter.map(f => )
  // }

}
