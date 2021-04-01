import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { ResolutionRangeSelectorComponent } from './resolution-range-selector.component';
import { ResolutionSelectorComponent } from '../resolution-selector/resolution-selector.component';
import { SharedModule } from '../../shared/shared.module';

describe('ResolutionRangeSelectorComponent', () => {

  let spectator: Spectator<ResolutionRangeSelectorComponent>;
  const createComponent = createComponentFactory({
    component: ResolutionRangeSelectorComponent,
    declarations: [ ResolutionSelectorComponent ],
    imports: [
      SharedModule,
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
    expect(spectator.queryAll('tailormap-resolution-selector').length).toEqual(2);
  });

});
