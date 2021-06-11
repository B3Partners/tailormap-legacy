import { CreateLayerFormComponent } from './create-layer-form.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('CreateLayerFormComponent', () => {
  let spectator: Spectator<CreateLayerFormComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CreateLayerFormComponent,
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      provideMockStore({ initialState }),
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
