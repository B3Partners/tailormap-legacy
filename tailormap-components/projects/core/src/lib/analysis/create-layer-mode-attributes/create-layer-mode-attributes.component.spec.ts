import { CreateLayerModeAttributesComponent } from './create-layer-mode-attributes.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { CriteriaDescriptionComponent } from '../criteria/criteria-description/criteria-description.component';
import { getMetadataServiceMockProvider } from '../../application/services/mocks/metadata.service.mock';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('CreateLayerModeAttributesComponent', () => {
  let spectator: Spectator<CreateLayerModeAttributesComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerModeAttributesComponent,
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      provideMockStore({ initialState }),
      getMetadataServiceMockProvider(),
    ],
    declarations: [
      CriteriaDescriptionComponent,
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
