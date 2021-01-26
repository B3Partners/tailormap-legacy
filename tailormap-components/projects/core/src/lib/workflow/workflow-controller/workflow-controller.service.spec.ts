import { WorkflowControllerService } from './workflow-controller.service';
import { createServiceFactory, createSpyObject, SpectatorService } from '@ngneat/spectator';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { WorkflowActionManagerService } from './workflow-action-manager.service';
import { of } from 'rxjs';

describe('WorkflowControllerService', () => {
  let service: SpectatorService<WorkflowControllerService>;
  const workflowActionManagerServiceMock = createSpyObject(WorkflowActionManagerService, {
    actionChanged$: of(null),
  });
  const createService = createServiceFactory({
    service: WorkflowControllerService,
    providers: [
      { provide: WorkflowFactoryService, useValue: createSpyObject(WorkflowFactoryService) },
      { provide: WorkflowActionManagerService, useValue: workflowActionManagerServiceMock },
    ],
  });

  beforeEach(() => {
    service = createService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
