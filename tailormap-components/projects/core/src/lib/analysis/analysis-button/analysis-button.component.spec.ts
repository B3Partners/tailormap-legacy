import { AnalysisButtonComponent } from './analysis-button.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { getUserLayerServiceMockProvider } from '../services/mocks/user-layer.service.mock';
import { defaultRootState } from '../../state/root-state.model';

describe('AnalysisButtonComponent', () => {

  let spectator: Spectator<AnalysisButtonComponent>;
  const initialState = { ...defaultRootState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AnalysisButtonComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getUserLayerServiceMockProvider(),
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
