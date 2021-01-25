import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { InputFieldComponent } from './input-field.component';

describe('InputFieldComponent', () => {
  let spectator: Spectator<InputFieldComponent>;
  const createComponent = createComponentFactory(InputFieldComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
