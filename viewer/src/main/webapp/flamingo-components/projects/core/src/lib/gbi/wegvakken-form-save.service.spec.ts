import { TestBed } from '@angular/core/testing';

import { WegvakkenFormSaveService } from './wegvakken-form-save.service';

describe('WegvakkenFormSaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WegvakkenFormSaveService = TestBed.get(WegvakkenFormSaveService);
    expect(service).toBeTruthy();
  });
});
