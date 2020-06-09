import { TestBed } from '@angular/core/testing';

import { FormActionsService } from './form-actions.service';

describe('FormActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormActionsService = TestBed.get(FormActionsService);
    expect(service).toBeTruthy();
  });
});
