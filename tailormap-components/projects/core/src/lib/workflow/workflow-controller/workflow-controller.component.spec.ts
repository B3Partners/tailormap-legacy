import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowControllerComponent } from './workflow-controller.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../shared/shared.module';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from './workflow-controller.service';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('WorkflowControllerComponent', () => {
  let spectator: Spectator<WorkflowControllerComponent>;
  const createComponent = createComponentFactory({
    component: WorkflowControllerComponent,
    imports: [
      SharedModule,
    ],
    providers: [
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
      { provide: WorkflowFactoryService, useValue: createSpyObject(WorkflowFactoryService) },
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
