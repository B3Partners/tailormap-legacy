import { WorkflowControllerComponent } from './workflow-controller.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../shared/shared.module';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from './workflow-controller.service';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { analysisStateKey, initialAnalysisState } from '../../analysis/state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../../feature-form/state/form.state';

describe('WorkflowControllerComponent', () => {
  let spectator: Spectator<WorkflowControllerComponent>;
  const initialState = { [formStateKey]: initialFormState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: WorkflowControllerComponent,
    imports: [
      SharedModule,
    ],
    providers: [
      provideMockStore({ initialState }),
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
      { provide: WorkflowFactoryService, useValue: createSpyObject(WorkflowFactoryService) },
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
