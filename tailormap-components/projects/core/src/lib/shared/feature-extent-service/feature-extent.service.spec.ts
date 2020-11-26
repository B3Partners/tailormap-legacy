import { TestBed } from '@angular/core/testing';

import { FeatureExtentService } from './feature-extent.service';

describe('FeatureExtentService', () => {
  let service: FeatureExtentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureExtentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
