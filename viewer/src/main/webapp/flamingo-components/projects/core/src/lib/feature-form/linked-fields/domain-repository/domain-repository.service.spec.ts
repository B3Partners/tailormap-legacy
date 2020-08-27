import { TestBed } from '@angular/core/testing';

import { DomainRepositoryService } from './domain-repository.service';

describe('DomainRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DomainRepositoryService = TestBed.get(DomainRepositoryService);
    expect(service).toBeTruthy();
  });
});
