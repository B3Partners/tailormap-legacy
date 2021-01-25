import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { BaseFieldComponent } from './base-field.component';

describe('BaseFieldComponent', () => {
  let spectator: Spectator<BaseFieldComponent>;
  const createComponent = createComponentFactory(BaseFieldComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
