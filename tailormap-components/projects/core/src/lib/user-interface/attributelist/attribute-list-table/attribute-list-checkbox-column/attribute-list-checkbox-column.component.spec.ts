import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListCheckboxColumnComponent } from './attribute-list-checkbox-column.component';

describe('AttributeListCheckboxColumnComponent', () => {
  let spectator: Spectator<AttributeListCheckboxColumnComponent>;
  const createComponent = createComponentFactory(AttributeListCheckboxColumnComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
