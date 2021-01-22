import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributelistComponent } from './attributelist.component';

describe('AttributelistComponent', () => {
  let spectator: Spectator<AttributelistComponent>;
  const createComponent = createComponentFactory(AttributelistComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
