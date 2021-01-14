import { SimpleCriteriaComponent } from './simple-criteria.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';
import { IdService } from '../../../shared/id-service/id.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SimpleCriteriaComponent', () => {
  let spectator: Spectator<SimpleCriteriaComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: SimpleCriteriaComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      IdService,
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
