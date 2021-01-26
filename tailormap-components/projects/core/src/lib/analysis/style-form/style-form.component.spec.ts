import { StyleFormComponent } from './style-form.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../shared/shared.module';
import { ResolutionSelectorComponent } from '../resolution-selector/resolution-selector.component';

describe('StyleFormComponent', () => {
  let spectator: Spectator<StyleFormComponent>;
  const createComponent = createComponentFactory({
    component: StyleFormComponent,
    imports: [
      SharedModule,
    ],
    declarations: [
      ResolutionSelectorComponent,
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
