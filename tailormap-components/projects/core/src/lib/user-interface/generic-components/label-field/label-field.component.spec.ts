import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { LabelFieldComponent } from './label-field.component';
import { SharedModule } from '../../../shared/shared.module';

describe('LabelFieldComponent', () => {
  let spectator: Spectator<LabelFieldComponent>;
  const createComponent = createComponentFactory({
    component: LabelFieldComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
