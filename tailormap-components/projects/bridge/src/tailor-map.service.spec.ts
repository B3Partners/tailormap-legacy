import { TestBed } from '@angular/core/testing';

import { TailorMapService } from './tailor-map.service';

describe('TailorMapService', () => {
  let service: TailorMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TailorMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
