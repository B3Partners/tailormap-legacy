import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { AttributeListStatisticsMenuComponent } from './attribute-list-statistics-menu.component';
import { SharedModule } from '../../../../shared/shared.module';

describe('AttributeListStatisticsMenuComponent', () => {
  let spectator: Spectator<AttributeListStatisticsMenuComponent>;
  const createComponent = createComponentFactory({
    component: AttributeListStatisticsMenuComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
