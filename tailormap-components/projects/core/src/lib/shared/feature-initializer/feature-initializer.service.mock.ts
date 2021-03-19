import { createSpyObject } from '@ngneat/spectator';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FeatureInitializerService } from './feature-initializer.service';
import { Feature, Geometry } from '../generated';
import { mockFeature, mockGeometry } from '../tests/test-data';

export const createFeatureInitializerServiceMockProvider = () => {
  return createSpyObject(FeatureInitializerService, {
    create(type: string, params: any): Feature {
      return mockFeature();
    },
    retrieveGeometry(feature: Feature): Geometry {
      return mockGeometry();
    },
  });
};

export const getFeatureInitializerServiceMockProvider = () => {
  return { provide: TailorMapService, useValue: createFeatureInitializerServiceMockProvider() };
};
