import { TestBed } from '@angular/core/testing';

import { LinkedAttributeRegistryService } from './linked-attribute-registry.service';

describe('RegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkedAttributeRegistryService = TestBed.get(LinkedAttributeRegistryService);
    expect(service).toBeTruthy();
  });
});
