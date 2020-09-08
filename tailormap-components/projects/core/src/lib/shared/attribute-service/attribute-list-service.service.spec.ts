import { TestBed } from '@angular/core/testing';

import { AttributeService } from './attribute.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AttributeListServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

  it('should be created', () => {
    const service: AttributeService = TestBed.get(AttributeService);
    expect(service).toBeTruthy();
  });
});
