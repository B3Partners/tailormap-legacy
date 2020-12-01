import { TestBed } from '@angular/core/testing';

import { FormCopyService } from './form-copy.service';

describe('FormCopyService', () => {
  let service: FormCopyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormCopyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
