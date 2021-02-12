import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { LabelFieldComponent } from './label-field.component';

describe('LabelFieldComponent', () => {
  let spectator: Spectator<LabelFieldComponent>;
  const createComponent = createComponentFactory(LabelFieldComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
