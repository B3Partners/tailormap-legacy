import { TestBed } from '@angular/core/testing';

import { GbiControllerService } from './gbi-controller.service';

describe('GbiControllerService', () => {
  let service: GbiControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GbiControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
