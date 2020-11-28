import { TestBed } from '@angular/core/testing';

import { OverlayServiceService } from './overlay.service';

describe('OverlayServiceService', () => {
  let service: OverlayServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
