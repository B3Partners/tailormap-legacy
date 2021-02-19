import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { InputFieldComponent } from './input-field.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormControl, FormGroup } from '@angular/forms';

describe('InputFieldComponent', () => {
  let spectator: Spectator<InputFieldComponent>;

  const createComponent = createComponentFactory({
    component: InputFieldComponent,
    imports: [ SharedModule ],
  });

  it('should create', () => {
    spectator = createComponent();
    spectator.setInput('id', 'test');
    spectator.setInput('value', 'the value');
    spectator.setInput('groep', new FormGroup({ test: new FormControl('the value') }));
    spectator.detectChanges();
    expect(spectator.component).toBeTruthy();
    expect(spectator.query<HTMLInputElement>("input").value).toEqual('the value');
  });
});
