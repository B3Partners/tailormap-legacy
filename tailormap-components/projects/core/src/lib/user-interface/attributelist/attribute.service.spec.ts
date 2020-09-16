import { TestBed } from '@angular/core/testing';

import { Attribute9Service } from './attribute9.service';

describe('Attribute9Service', () => {
  let service: Attribute9Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Attribute9Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
