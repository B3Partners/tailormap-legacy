import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListContentComponent } from './attribute-list-content.component';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { getStatisticServiceMockProvider } from '../../../shared/statistic-service/mocks/statistic.service.mock';
import { SharedModule } from '../../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AttributeListTableComponent', () => {

  let spectator: Spectator<AttributeListContentComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListContentComponent,
    imports: [ SharedModule ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    providers: [
      provideMockStore({ initialState }),
      getStatisticServiceMockProvider(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
