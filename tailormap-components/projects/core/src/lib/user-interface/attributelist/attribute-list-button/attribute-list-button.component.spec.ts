import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListButtonComponent } from './attribute-list-button.component';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';

describe('AttributeListButtonComponent', () => {

  let spectator: Spectator<AttributeListButtonComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListButtonComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
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
