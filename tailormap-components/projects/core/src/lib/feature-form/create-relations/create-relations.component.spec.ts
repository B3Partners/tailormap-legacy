import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { CreateRelationsComponent } from './create-relations.component';
import { SharedModule } from '../../shared/shared.module';
import { provideMockStore } from '@ngrx/store/testing';
import { defaultRootState } from '../../state/root-state.model';
import { getFormActionsServiceMockProvider } from '../form-actions/form-actions.service.mock';

describe('CreateRelationsComponent', () => {
  let spectator: Spectator<CreateRelationsComponent>;
  const createComponent = createComponentFactory({
    component: CreateRelationsComponent,
    providers: [
      provideMockStore({ initialState: { ...defaultRootState } }),
      getFormActionsServiceMockProvider(),
    ],
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();
    expect(spectator.component).toBeTruthy();
  });
});
