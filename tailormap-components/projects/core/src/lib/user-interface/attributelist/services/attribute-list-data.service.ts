import { Injectable } from '@angular/core';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectApplicationId } from '../../../application/state/application.selectors';
import { catchError, concatMap, map, take } from 'rxjs/operators';
import {
  AttributeListFeature, AttributeListParameters, AttributeListResponse, RelatedFeatureType,
} from '../../../shared/attribute-service/attribute-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { forkJoin, Observable, of } from 'rxjs';
import { DetailsState } from '../attributelist-common/attributelist-enums';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { ApplicationService } from '../../../application/services/application.service';

export interface LoadDataResult {
  layerId: string;
  errorMessage?: string;
  totalCount: number;
  features: AttributeListRowModel[];
  relatedFeatures: RelatedFeatureType[];
}

@Injectable({
  providedIn: 'root',
})
export class AttributeListDataService {

  constructor(
    private store$: Store<AttributeListState>,
    private attributeService: AttributeService,
    private formConfigRepoService: FormconfigRepositoryService,
    private applicationService: ApplicationService,
  ) {}

  public loadData(
    tab: AttributeListTabModel,
  ): Observable<LoadDataResult> {
      const attrParams: AttributeListParameters = {
        application: this.applicationService.getId(),
        appLayer: +(tab.layerId),
        filter: this.getFilter(tab),
        limit: tab.pageSize,
        page: 1,
        start: tab.pageIndex * tab.pageSize,
        clearTotalCountCache: true,
        dir: tab.sortDirection,
        sort: tab.sortedColumn || '',
      };
      return forkJoin([
        this.attributeService.features$(attrParams).pipe(
          catchError(e => of<AttributeListResponse>({ success: false, message: '', features: [], total: 0 })),
        ),
        this.formConfigRepoService.getFormConfigForLayer$(tab.layerName).pipe(take(1)),
      ]).pipe(
        map(([ response, formConfig ]) => {
          if (!response.success) {
            return {
              layerId: tab.layerId,
              totalCount: 0,
              features: [],
              relatedFeatures: [],
              errorMessage: response.message || 'Failed loading attributes',
            }
          }
          return {
            layerId: tab.layerId,
            totalCount: response.total,
            features: this.decorateFeatures(response.features, formConfig),
            relatedFeatures: response.features.length > 0 ? (response.features[0].related_featuretypes || []) : [],
          };
        }),
      )
  }

  private decorateFeatures(features: AttributeListFeature[], formConfig: FormConfiguration): AttributeListRowModel[] {
    return features.map<AttributeListRowModel>(feature => {
      const relatedFeatures = feature.related_featuretypes || [];
      const decoratedFeature: AttributeListRowModel = {
        _checked: false,
        _expanded: false,
        _selected: false,
        rowId: `${feature.__fid}`,
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

  private getFilter(tab: AttributeListTabModel) {
    // @TODO: implement
    return '';
  }

}
