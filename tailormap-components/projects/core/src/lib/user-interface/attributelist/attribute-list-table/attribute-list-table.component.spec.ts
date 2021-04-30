import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTableComponent } from './attribute-list-table.component';
import { SharedModule } from '../../../shared/shared.module';

describe('AttributeListTableComponent', () => {
  let spectator: Spectator<AttributeListTableComponent>;
  const createComponent = createComponentFactory({
    component: AttributeListTableComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
