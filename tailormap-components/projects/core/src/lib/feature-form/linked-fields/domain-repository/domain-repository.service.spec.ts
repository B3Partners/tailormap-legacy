import { TestBed } from '@angular/core/testing';

import { DomainRepositoryService } from './domain-repository.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DomainRepositoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

  it('should be created', () => {
    const service: DomainRepositoryService = TestBed.inject(DomainRepositoryService);
    expect(service).toBeTruthy();
  });
});
