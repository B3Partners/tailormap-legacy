import { CreateLayerStylingComponent } from './create-layer-styling.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { getUserLayerServiceMockProvider } from '../services/mocks/user-layer.service.mock';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('CreateLayerStylingComponent', () => {
  let spectator: Spectator<CreateLayerStylingComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerStylingComponent,
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      provideMockStore({ initialState }),
      getUserLayerServiceMockProvider(),
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
