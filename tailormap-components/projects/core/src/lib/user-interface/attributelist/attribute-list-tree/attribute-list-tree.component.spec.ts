import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTreeComponent } from './attribute-list-tree.component';

describe('AttributeListTreeComponent', () => {
  let spectator: Spectator<AttributeListTreeComponent>;
  const createComponent = createComponentFactory(AttributeListTreeComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
