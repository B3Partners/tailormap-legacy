import { TestBed } from '@angular/core/testing';

import { WorkflowFactoryService } from './workflow-factory.service';

describe('WorkflowFactoryService', () => {
  let service: WorkflowFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
