import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListColumnSelectionComponent } from './attribute-list-column-selection.component';
import { getOverlayRefProvider } from '../../../shared/overlay-service/mocks/overlay-ref.mock';
import { OVERLAY_DATA } from '../../../shared/overlay-service/overlay.service';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('AttributeListColumnSelectionComponent', () => {

  let spectator: Spectator<AttributeListColumnSelectionComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListColumnSelectionComponent,
    providers: [
      provideMockStore({ initialState }),
      getOverlayRefProvider(),
      { provide: OVERLAY_DATA, useValue: { featureType: 1} },
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
