import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { LabelFieldComponent } from './label-field.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormFieldType } from '../../../feature-form/form/form-models';

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

  it('renders hyperlink', () => {
    spectator = createComponent({
      props: {
        fieldType: FormFieldType.HYPERLINK,
        value: 'https://test.nl',
      },
    });
    expect(spectator.component).toBeTruthy();
    const href = spectator.query('a');
    expect(href).toBeTruthy();
    expect(href.getAttribute('href')).toEqual('https://test.nl');
  });

  it('renders hyperlink without http', () => {
    spectator = createComponent({
      props: {
        fieldType: FormFieldType.HYPERLINK,
        value: 'test.nl',
      },
    });
    expect(spectator.component).toBeTruthy();
    const href = spectator.query('a');
    expect(href).toBeTruthy();
    expect(href.getAttribute('href')).toEqual('//test.nl');
  });

});
