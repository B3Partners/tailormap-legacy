import { createSpyObject } from '@ngneat/spectator';
import { AttributeListDataService, LoadDataResult, LoadTotalCountResult } from '../attribute-list-data.service';
import { Observable, of } from 'rxjs';
import { AttributeListFeatureTypeData } from '../../models/attribute-list-feature-type-data.model';
import { AttributeListTabModel } from '../../models/attribute-list-tab.model';

const dummyLoadDataResult: LoadDataResult = {
  featureType: 1,
  rows: [],
  totalCount: 0,
  layerId: '1',
  relatedFeatures: [],
};

export const createAttributeListDataServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListDataService, any>>) => {
  return createSpyObject(AttributeListDataService, {
    loadData$(
      tab: AttributeListTabModel,
      tabFeatureData: AttributeListFeatureTypeData[],
    ): Observable<LoadDataResult> {
      return of(dummyLoadDataResult);
    },
    loadDataForFeatureType$(
      tab: AttributeListTabModel,
      featureType: number,
      tabFeatureData: AttributeListFeatureTypeData[],
    ): Observable<LoadDataResult> {
      return of(dummyLoadDataResult);
    },
    loadTotalCount$(
      tab: AttributeListTabModel,
      tabFeatureData: AttributeListFeatureTypeData[],
    ): Observable<LoadTotalCountResult[]> {
      return of([{ featureType: 1, totalCount: 0 }]);
    },
    ...overrides,
  });
};

export const getAttributeListDataServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListDataService, any>>) => {
  return { provide: AttributeListDataService, useValue: createAttributeListDataServiceMockProvider(overrides) };
};
