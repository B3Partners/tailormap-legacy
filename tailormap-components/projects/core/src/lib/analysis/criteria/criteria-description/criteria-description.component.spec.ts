import { CriteriaDescriptionComponent } from './criteria-description.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';
import { getMetadataServiceMockProvider } from '../../../application/services/mocks/metadata.service.mock';

describe('CriteriaDescriptionComponent', () => {
  let spectator: Spectator<CriteriaDescriptionComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CriteriaDescriptionComponent,
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
