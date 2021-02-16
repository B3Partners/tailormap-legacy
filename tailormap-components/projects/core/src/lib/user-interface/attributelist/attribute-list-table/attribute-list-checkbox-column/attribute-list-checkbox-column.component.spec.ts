import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListCheckboxColumnComponent } from './attribute-list-checkbox-column.component';
import { attributeListStateKey, initialAttributeListState } from '../../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../../shared/shared.module';

describe('AttributeListCheckboxColumnComponent', () => {

  let spectator: Spectator<AttributeListCheckboxColumnComponent>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: AttributeListCheckboxColumnComponent,
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
