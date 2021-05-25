import { createSpyObject } from '@ngneat/spectator';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { FeatureInitializerService } from './feature-initializer.service';
import { Feature } from '../generated';
import { mockFeature } from '../tests/test-data';

export const createFeatureInitializerServiceMockProvider = () => {
  return createSpyObject(FeatureInitializerService, {
    create(type: string, params: any): Feature {
      return mockFeature();
    },
  });
};

export const getFeatureInitializerServiceMockProvider = () => {
  return { provide: TailorMapService, useValue: createFeatureInitializerServiceMockProvider() };
};
