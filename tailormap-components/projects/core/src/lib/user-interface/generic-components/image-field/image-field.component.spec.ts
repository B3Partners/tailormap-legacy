import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { ImageFieldComponent } from './image-field.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldType } from '../../../feature-form/form/form-models';

describe('ImageFieldComponent', () => {
  let spectator: Spectator<ImageFieldComponent>;

  const createComponent = createComponentFactory({
    component: ImageFieldComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();
    spectator.setInput('attribute', { value: '', tab: 1, key: 'image', label: 'The image', type: FormFieldType.IMAGE, column: 1 });
    spectator.setInput('editing', false);
    spectator.setInput('groep', new FormGroup({ test: new FormControl('the value') }));
    spectator.detectChanges();
    expect(spectator.component).toBeTruthy();
    expect(spectator.query<HTMLDivElement>('.form-field--view-only').textContent).toMatch('The image');
  });
});
