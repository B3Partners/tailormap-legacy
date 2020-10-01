import { TestBed } from '@angular/core/testing';

import { LayerUtilsService } from './layer-utils.service';

describe('LayerUtilsService', () => {
  let service: LayerUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
