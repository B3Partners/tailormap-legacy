import { EditBarComponent } from './edit-bar.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { getTailorMapServiceMockProvider } from '../../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';

import { MenuButtonComponent } from '../add-feature-menu/menu-button/menu-button.component';
import { formStateKey, initialFormState } from '../../../feature-form/state/form.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('EditBarComponent', () => {
  let spectator: Spectator<EditBarComponent>;
  const initialState = { [formStateKey]: initialFormState };
  let store: MockStore;
  const createComponent = createComponentFactory({
    component: EditBarComponent,
    declarations: [
      MenuButtonComponent,
    ],
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
