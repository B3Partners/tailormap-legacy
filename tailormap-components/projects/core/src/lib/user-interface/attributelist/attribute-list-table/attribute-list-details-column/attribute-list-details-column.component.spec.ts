import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListDetailsColumnComponent } from './attribute-list-details-column.component';
import { attributeListStateKey, initialAttributeListState } from '../../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../../shared/shared.module';

describe('AttributeListDetailsColumnComponent', () => {

  let spectator: Spectator<AttributeListDetailsColumnComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListDetailsColumnComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  })

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
