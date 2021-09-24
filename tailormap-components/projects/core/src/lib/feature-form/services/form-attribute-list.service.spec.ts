import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { FormAttributeListService } from './form-attribute-list.service';
import { AttributeListService } from '../../../../../../../../tailormap-frontend/dist/core-components';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';
import { getApplicationServiceMockProvider } from '../../application/services/mocks/application.service.mock';
import { FeatureControllerService } from '../../shared/generated';

class MockAttributeListService {
  public getSelectedRow$() {
    return of(null);
  }
}

class MockFeatureControllerService {
  public getFeaturesForIds() {
    return of([]);
  }
}

describe('FormAttributeListService', () => {
  let spectator: SpectatorService<FormAttributeListService>;
  const createService = createServiceFactory({
    service: FormAttributeListService,
    providers: [
      { provide: AttributeListService, useClass: MockAttributeListService },
      provideMockStore(),
      getApplicationServiceMockProvider(),
      { provide: FeatureControllerService, useClass: MockFeatureControllerService },
    ],
  });

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
