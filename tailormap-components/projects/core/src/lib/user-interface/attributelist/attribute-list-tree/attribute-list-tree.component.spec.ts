import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTreeComponent } from './attribute-list-tree.component';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';

describe('AttributeListTreeComponent', () => {

  let spectator: Spectator<AttributeListTreeComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListTreeComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
