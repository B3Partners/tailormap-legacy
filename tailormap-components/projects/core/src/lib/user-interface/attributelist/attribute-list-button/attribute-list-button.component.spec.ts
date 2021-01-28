import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListButtonComponent } from './attribute-list-button.component';

describe('AttributeListButtonComponent', () => {
  let spectator: Spectator<AttributeListButtonComponent>;
  const createComponent = createComponentFactory(AttributeListButtonComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
