import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListDetailsColumnComponent } from './attribute-list-details-column.component';

describe('AttributeListDetailsColumnComponent', () => {
  let spectator: Spectator<AttributeListDetailsColumnComponent>;
  const createComponent = createComponentFactory(AttributeListDetailsColumnComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
