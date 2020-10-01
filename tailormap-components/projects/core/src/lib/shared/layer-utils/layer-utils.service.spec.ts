import { TestBed } from '@angular/core/testing';
import { LayerUtils } from './layer-utils.service';


describe('LayerUtilsService', () => {
  let service: LayerUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
