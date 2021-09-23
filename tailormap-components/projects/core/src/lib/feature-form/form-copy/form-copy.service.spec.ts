import { TestBed } from '@angular/core/testing';

import { FormCopyService } from './form-copy.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { provideMockStore } from '@ngrx/store/testing';

describe('FormCopyService', () => {
  let service: FormCopyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ provideMockStore({}), getTailorMapServiceMockProvider() ],
    });
    service = TestBed.inject(FormCopyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
