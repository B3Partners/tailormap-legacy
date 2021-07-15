import { WorkflowFactoryService } from './workflow-factory.service';
import { createServiceFactory, createSpyObject, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { SharedModule } from '../../shared/shared.module';
import { FeatureControllerService } from '../../shared/generated';
import { GeometryConfirmService } from '../../user-interface/geometry-confirm-buttons/geometry-confirm.service';
import { ConfirmDialogService } from '@tailormap/shared';
import { FeatureInitializerService } from '../../shared/feature-initializer/feature-initializer.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../../feature-form/state/form.state';
import { applicationStateKey, initialApplicationState } from '../../application/state/application.state';
import { createApplicationServiceMock } from '../../application/services/mocks/application.service.mock';
import { APPLICATION_SERVICE } from '@tailormap/models';

describe('WorkflowFactoryService', () => {
  let spectator: SpectatorService<WorkflowFactoryService>;
  const initialState = {
    [formStateKey]: initialFormState,
    [applicationStateKey]: initialApplicationState,
  };
  let store: MockStore;
  const createService = createServiceFactory({
    service: WorkflowFactoryService,
    imports: [
      SharedModule,
    ],
    providers: [
      provideMockStore({ initialState }),
      getTailorMapServiceMockProvider(),
      { provide: APPLICATION_SERVICE, useValue: createApplicationServiceMock() },
      { provide: FeatureControllerService, useValue: createSpyObject(FeatureControllerService) },
      { provide: GeometryConfirmService, useValue: createSpyObject(GeometryConfirmService) },
      { provide: ConfirmDialogService, useValue: createSpyObject(ConfirmDialogService) },
      { provide: FeatureInitializerService, useValue: createSpyObject(FeatureInitializerService) },
    ],
  });

  beforeEach(() => {
    spectator = createService();
    store = spectator.inject(MockStore);
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
