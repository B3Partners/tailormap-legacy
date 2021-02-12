import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import { FormconfigRepositoryService } from './formconfig-repository.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { mockConfigsJson } from './formconfig-mock.module.spec';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { FeatureControllerService } from '../generated';
import { createSpyObject } from '@ngneat/spectator';
import { Observable, of } from 'rxjs';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../../feature-form/state/form.state';

describe('FormconfigRepositoryService', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  let store: MockStore;
  const initialState = { [formStateKey]: initialFormState };
  const featureControllerMockService = createSpyObject(FeatureControllerService, {
    featuretypeInformation(): Observable<[]> {
      return of([]);
    }
  });
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        provideMockStore({ initialState }),
        getTailorMapServiceMockProvider({ getApplicationId() { return 1; }}),
        { provide: FeatureControllerService, useValue: featureControllerMockService },
      ]
    });
    injector = getTestBed();
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);

  });

  const expectConfigRequest = () => {
    const req = httpMock.expectOne('/viewer/action/form?application=1');
    req.flush(JSON.parse(mockConfigsJson));
  };

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expectConfigRequest();
    expect(service).toBeTruthy();
  });


});
