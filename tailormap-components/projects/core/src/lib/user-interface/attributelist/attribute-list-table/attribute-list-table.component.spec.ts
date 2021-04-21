import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTableComponent } from './attribute-list-table.component';

describe('AttributeListTableComponent', () => {
  let spectator: Spectator<AttributeListTableComponent>;
  const createComponent = createComponentFactory(AttributeListTableComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
