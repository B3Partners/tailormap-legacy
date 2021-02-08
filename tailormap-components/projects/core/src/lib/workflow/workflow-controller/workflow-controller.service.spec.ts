import { WorkflowControllerService } from './workflow-controller.service';
import { createServiceFactory, createSpyObject, SpectatorService } from '@ngneat/spectator';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialWorkflowState, workflowStateKey } from '../state/workflow.state';

describe('WorkflowControllerService', () => {
  let service: SpectatorService<WorkflowControllerService>;
  const initialState = { [workflowStateKey]: initialWorkflowState };
  let store: MockStore;

  const createService = createServiceFactory({
    service: WorkflowControllerService,
    providers: [
      { provide: WorkflowFactoryService, useValue: createSpyObject(WorkflowFactoryService) },
      provideMockStore({ initialState }),
    ],
  });

  beforeEach(() => {
    service = createService();
    store = service.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
