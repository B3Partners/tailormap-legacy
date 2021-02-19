import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import { FormConfigRepositoryService } from './form-config-repository.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { mockConfigsJson } from './formconfig-mock.module.spec';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { FeatureControllerService } from '../generated';
import { createSpyObject } from '@ngneat/spectator';
import { Observable, of } from 'rxjs';

describe('FormConfigRepositoryService', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
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
        getTailorMapServiceMockProvider({ getApplicationId() { return 1; }}),
        { provide: FeatureControllerService, useValue: featureControllerMockService },
      ]
    });
    injector = getTestBed();
    httpMock = TestBed.inject(HttpTestingController);
  });

  const expectConfigRequest = () => {
    const req = httpMock.expectOne('/viewer/action/form?application=1');
    req.flush(JSON.parse(mockConfigsJson));
  };

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: FormConfigRepositoryService = TestBed.inject(FormConfigRepositoryService);
    service.loadFormConfiguration().subscribe();
    expectConfigRequest();
    expect(service).toBeTruthy();
  });


});
