import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListColumnSelectionComponent } from './attribute-list-column-selection.component';

describe('AttributeListColumnSelectionComponent', () => {
  let spectator: Spectator<AttributeListColumnSelectionComponent>;
  const createComponent = createComponentFactory(AttributeListColumnSelectionComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
