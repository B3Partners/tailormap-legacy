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

describe('FormconfigRepositoryService', () => {
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
        getTailorMapServiceMockProvider(),
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
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expectConfigRequest();
    expect(service).toBeTruthy();
  });

  it('should return all formconfigs', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expectConfigRequest();
    expect(service.getAllFormConfigs()).toBeTruthy();
    expect(service.getAllFormConfigs()).toBeTruthy();
    expect(service.getAllFormConfigs().get('test')).toBeTruthy();
  });

  it('should return all featuretypes', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expectConfigRequest();
    expect(service.getFeatureTypes()).toContain('test');
    expect(service.getFeatureTypes().length).toBe(1);
  });

  it('should return no featuretypes when no configs present', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    const req = httpMock.expectOne('/viewer/action/form?application=1');
    req.flush({ config: { }});
    expect(service.getFeatureTypes().length).toBe(0);
  });
});
