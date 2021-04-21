import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTableComponent } from './attribute-list-table.component';
import { MatMenuModule } from '@angular/material/menu';

describe('AttributeListTableComponent', () => {
  let spectator: Spectator<AttributeListTableComponent>;
  const createComponent = createComponentFactory({
    component: AttributeListTableComponent,
    imports: [ MatMenuModule ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
