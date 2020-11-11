import { TestBed } from '@angular/core/testing';

import { AttributelistColumnsService } from './attributelist-columns.service';

describe('AttributelistColumnsService', () => {
  let service: AttributelistColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributelistColumnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
