import { FormCreatorComponent } from './form-creator.component';
import { FeatureControllerService } from '../../shared/generated';
import {SharedModule} from '../../shared/shared.module';
import {FormfieldComponent} from '../form-field/formfield.component';
import {FormComponent} from '../form/form.component';
import {FormTreeComponent} from '../form-tree/form-tree.component';
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { workflowStateKey, initialWorkflowState } from '../../workflow/state/workflow.state';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { formStateKey, initialFormState } from '../state/form.state';

describe('FormCreatorComponent', () => {

  let spectator: Spectator<FormCreatorComponent>;
  const initialState = {
    [workflowStateKey]: initialWorkflowState,
    [formStateKey]: initialFormState,
  };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: FormCreatorComponent,
    imports: [ SharedModule, FormConfigMockModule ],
    providers: [
      FeatureControllerService,
      provideMockStore({ initialState }),
    ],
    declarations: [
      FormComponent,
      FormTreeComponent,
      FormfieldComponent,
      FormCreatorComponent,
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
