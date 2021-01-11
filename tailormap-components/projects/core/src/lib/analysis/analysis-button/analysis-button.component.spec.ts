import { AnalysisButtonComponent } from './analysis-button.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';

describe('AnalysisButtonComponent', () => {

  let spectator: Spectator<AnalysisButtonComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AnalysisButtonComponent,
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
