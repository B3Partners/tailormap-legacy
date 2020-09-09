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

describe('FormconfigRepositoryService', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
    injector = getTestBed();
    httpMock = TestBed.inject(HttpTestingController);

  });

  const expectConfigRequest = () => {
    const req = httpMock.expectOne('/viewer/action/form');
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
    expect(service.getAllFormConfigs().config).toBeTruthy();
    expect(service.getAllFormConfigs().config['test']).toBeTruthy();
  });

  it('should return all featuretypes', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    expectConfigRequest();
    expect(service.getFeatureTypes()).toContain('test');
    expect(service.getFeatureTypes().length).toBe(1);
  });

  it('should return no featuretypes when no configs present', () => {
    const service: FormconfigRepositoryService = TestBed.inject(FormconfigRepositoryService);
    const req = httpMock.expectOne('/viewer/action/form');
    req.flush({ config: { }});
    expect(service.getFeatureTypes().length).toBe(0);
  });
});
