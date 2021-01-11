import { CreateLayerPanelComponent } from './create-layer-panel.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';

describe('CreateLayerPanelComponent', () => {
  let spectator: Spectator<CreateLayerPanelComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerPanelComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
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
