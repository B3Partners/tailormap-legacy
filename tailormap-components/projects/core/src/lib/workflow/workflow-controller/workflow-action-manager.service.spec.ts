import { TestBed } from '@angular/core/testing';

import { WorkflowActionManagerService } from './workflow-action-manager.service';

describe('WorkflowActionManagerService', () => {
  let service: WorkflowActionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowActionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
