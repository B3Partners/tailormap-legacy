import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { CreateRelationsComponent } from './create-relations.component';

describe('CreateRelationsComponent', () => {
  let spectator: Spectator<CreateRelationsComponent>;
  const createComponent = createComponentFactory(CreateRelationsComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
