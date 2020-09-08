import { TestBed } from '@angular/core/testing';

import { LayerVisibilityServiceService } from './layer-visibility-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LayerVisibilityServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: LayerVisibilityServiceService = TestBed.inject(LayerVisibilityServiceService);
    expect(service).toBeTruthy();
  });
});
