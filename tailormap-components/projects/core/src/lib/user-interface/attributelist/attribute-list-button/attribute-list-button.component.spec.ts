import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListButtonComponent } from './attribute-list-button.component';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';
import { setAttributeListVisibility } from '../state/attribute-list.actions';
import { selectAttributeListVisible } from '../state/attribute-list.selectors';

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

  it('should toggle attribute list visibility', (done) => {
    expect(spectator.component).toBeTruthy();
    store.scannedActions$.subscribe(action => {
      if (action.type === setAttributeListVisibility.type) {
        expect((action as ReturnType<typeof setAttributeListVisibility>).visible).toEqual(true);
        done();
      }
    });
    spectator.click('button');
  });

  it('should hide attribute list if visible', (done) => {
    store.scannedActions$.subscribe(action => {
      if (action.type === setAttributeListVisibility.type) {
        expect((action as ReturnType<typeof setAttributeListVisibility>).visible).toEqual(false);
        done();
      }
    });
    store.overrideSelector(selectAttributeListVisible, true);
    spectator.click('button');
  });

});
