import { CreateLayerLayerSelectionComponent } from './create-layer-layer-selection.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { getMetadataServiceMockProvider } from '../../application/services/mocks/metadata.service.mock';
import { defaultRootState } from '../../state/root-state.model';

describe('CreateLayerLayerSelectionComponent', () => {
  let spectator: Spectator<CreateLayerLayerSelectionComponent>;
  const initialState = { ...defaultRootState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerLayerSelectionComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getMetadataServiceMockProvider(),
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
