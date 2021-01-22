import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributelistButtonComponent } from './attributelist-button.component';

describe('AttributelistButtonComponent', () => {
  let spectator: Spectator<AttributelistButtonComponent>;
  const createComponent = createComponentFactory(AttributelistButtonComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
