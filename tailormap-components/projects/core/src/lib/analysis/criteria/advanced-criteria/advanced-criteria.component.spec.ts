import { AdvancedCriteriaComponent } from './advanced-criteria.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdService } from '../../../shared/id-service/id.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { SharedModule } from '../../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('AdvancedCriteriaComponent', () => {

  let spectator: Spectator<AdvancedCriteriaComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AdvancedCriteriaComponent,
    imports: [ SharedModule, MatIconTestingModule ],
    providers: [
      provideMockStore({ initialState }),
      IdService,
      ConfirmDialogService,
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
