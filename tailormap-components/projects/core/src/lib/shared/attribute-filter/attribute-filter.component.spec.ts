import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeFilterComponent } from './attribute-filter.component';
import { SharedModule } from '../shared.module';

describe('AttributeFilterComponent', () => {
  let spectator: Spectator<AttributeFilterComponent>;
  const createComponent = createComponentFactory({
    component: AttributeFilterComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
