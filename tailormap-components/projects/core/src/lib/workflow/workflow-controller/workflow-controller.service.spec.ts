import { TestBed } from '@angular/core/testing';

import { WorkflowControllerService } from './workflow-controller.service';

describe('WorkflowControllerService', () => {
  let service: WorkflowControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
