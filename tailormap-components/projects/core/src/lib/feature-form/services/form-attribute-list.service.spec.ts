import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { FormAttributeListService } from './form-attribute-list.service';
import { AttributeListService } from '@tailormap/core-components';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';
import { createApplicationServiceMock } from '../../application/services/mocks/application.service.mock';
import { FeatureControllerService } from '../../shared/generated';
import { APPLICATION_SERVICE } from '@tailormap/api';
import { WorkflowControllerService } from '../../workflow/workflow-controller/workflow-controller.service';

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

class MockWorkflowControllerService {
  public zoomToFeature() {}
}

describe('FormAttributeListService', () => {
  let spectator: SpectatorService<FormAttributeListService>;
  const createService = createServiceFactory({
    service: FormAttributeListService,
    providers: [
      { provide: AttributeListService, useClass: MockAttributeListService },
      provideMockStore(),
      { provide: APPLICATION_SERVICE, useValue: createApplicationServiceMock() },
      { provide: FeatureControllerService, useClass: MockFeatureControllerService },
      { provide: WorkflowControllerService, useClass: MockWorkflowControllerService },
    ],
  });

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
