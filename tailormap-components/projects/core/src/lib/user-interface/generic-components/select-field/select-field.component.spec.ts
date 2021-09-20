import { SelectFieldComponent } from './select-field.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldType } from '../../../feature-form/form/form-models';

describe('SelectFieldComponent', () => {
  let spectator: Spectator<SelectFieldComponent>;

  const createComponent = createComponentFactory({
    component: SelectFieldComponent,
    imports: [ SharedModule ],
  });

  beforeEach(() => {
    spectator = createComponent({props: {
        attribute: { key: 'att', tab: 1, column: 1, label: 'test', type: FormFieldType.SELECT, value: null, options: [] },
        groep: new FormGroup({ test: new FormControl('the value') }),
      }});
    spectator.detectChanges();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
