import { Injectable } from '@angular/core';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectApplicationId } from '../../../application/state/application.selectors';
import { concatMap, map } from 'rxjs/operators';
import { AttributeListFeature, AttributeListParameters, RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { Observable } from 'rxjs';

export interface LoadDataResult {
  layerId: string;
  errorMessage?: string;
  totalCount: number;
  features: AttributeListFeature[];
  relatedFeatures: RelatedFeatureType[];
}

@Injectable({
  providedIn: 'root',
})
export class AttributeListDataService {

  constructor(
    private store$: Store<AttributeListState>,
    private attributeService: AttributeService,
  ) {}

  public loadData(
    tab: AttributeListTabModel,
  ): Observable<LoadDataResult> {
    return this.store$.select(selectApplicationId)
      .pipe(
        concatMap(appId => {
          const attrParams: AttributeListParameters = {
            application: appId,
            appLayer: +(tab.layerId),
            filter: this.getFilter(tab),
            limit: tab.pageSize,
            page: 1,
            start: tab.pageIndex * tab.pageSize,
            clearTotalCountCache: true,
            dir: tab.sortDirection,
            sort: tab.sortedColumn || '',
          };
          return this.attributeService.features$(attrParams);
        }),
        map(response => {
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
            features: response.features,
            relatedFeatures: response.features.length > 0 ? response.features[0].related_featuretypes : [],
          };
        }),
      )
  }

  private getFilter(tab: AttributeListTabModel) {
    // @TODO: implement
    return '';
  }

}
