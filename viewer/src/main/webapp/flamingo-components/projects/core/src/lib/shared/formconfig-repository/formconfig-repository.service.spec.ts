import { TestBed } from '@angular/core/testing';

import { FormconfigRepositoryService } from './formconfig-repository.service';

describe('FormconfigRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormconfigRepositoryService = TestBed.get(FormconfigRepositoryService);
    expect(service).toBeTruthy();
  });
});
