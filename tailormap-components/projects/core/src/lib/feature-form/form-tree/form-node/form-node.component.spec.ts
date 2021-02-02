import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { FormNodeComponent } from './form-node.component';

describe('FormNodeComponent', () => {
  let spectator: Spectator<FormNodeComponent>;
  const createComponent = createComponentFactory(FormNodeComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
