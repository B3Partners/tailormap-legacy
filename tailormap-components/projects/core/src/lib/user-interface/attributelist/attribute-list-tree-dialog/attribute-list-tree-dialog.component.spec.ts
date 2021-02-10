import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTreeDialogComponent } from './attribute-list-tree-dialog.component';

describe('AttributeListTreeDialogComponent', () => {
  let spectator: Spectator<AttributeListTreeDialogComponent>;
  const createComponent = createComponentFactory(AttributeListTreeDialogComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
