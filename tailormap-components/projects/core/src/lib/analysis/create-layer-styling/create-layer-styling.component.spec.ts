import { CreateLayerStylingComponent } from './create-layer-styling.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { getUserLayerServiceMockProvider } from '../services/mocks/user-layer.service.mock';

describe('CreateLayerStylingComponent', () => {
  let spectator: Spectator<CreateLayerStylingComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerStylingComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getUserLayerServiceMockProvider(),
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
