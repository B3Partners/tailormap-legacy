import { TestBed } from '@angular/core/testing';

import { FeatureInitializerService } from './feature-initializer.service';

describe('FeatureInitializerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureInitializerService = TestBed.get(FeatureInitializerService);
    expect(service).toBeTruthy();
  });
});
