import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListComponent } from './attribute-list.component';

describe('AttributeListComponent', () => {
  let spectator: Spectator<AttributeListComponent>;
  const createComponent = createComponentFactory(AttributeListComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
