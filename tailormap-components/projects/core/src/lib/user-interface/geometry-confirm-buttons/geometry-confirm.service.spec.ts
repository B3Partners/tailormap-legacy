import { TestBed } from '@angular/core/testing';

import { GeometryConfirmService } from './geometry-confirm.service';

describe('GeometryConfirmService', () => {
  let service: GeometryConfirmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeometryConfirmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
