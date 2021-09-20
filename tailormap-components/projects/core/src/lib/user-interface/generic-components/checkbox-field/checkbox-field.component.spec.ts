import { CheckboxFieldComponent } from './checkbox-field.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldType } from '../../../feature-form/form/form-models';

describe('CheckboxFieldComponent', () => {
  let spectator: Spectator<CheckboxFieldComponent>;

  const createComponent = createComponentFactory({
    component: CheckboxFieldComponent,
    imports: [ SharedModule ],
  });

  beforeEach(() => {
    spectator = createComponent({props: {
        attribute: { key: 'att', tab: 1, column: 1, label: 'test', type: FormFieldType.CHECKBOX, value: null },
        groep: new FormGroup({ test: new FormControl('the value') }),
    }});
    spectator.detectChanges();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
