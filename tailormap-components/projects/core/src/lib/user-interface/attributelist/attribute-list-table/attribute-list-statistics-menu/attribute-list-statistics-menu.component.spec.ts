import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListStatisticsMenuComponent } from './attribute-list-statistics-menu.component';

describe('AttributeListStatisticsMenuComponent', () => {
  let spectator: Spectator<AttributeListStatisticsMenuComponent>;
  const createComponent = createComponentFactory(AttributeListStatisticsMenuComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
