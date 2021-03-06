import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { ErrorMessageComponent } from './error-message.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ErrorMessageComponent', () => {
  let spectator: Spectator<ErrorMessageComponent>;
  const createComponent = createComponentFactory({
    component: ErrorMessageComponent,
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  it('should create', () => {
    spectator = createComponent();
    expect(spectator.component).toBeTruthy();
  });

  it('should render error message', () => {
    spectator = createComponent();
    spectator.setInput('errorMessage', 'This is the error!');
    expect(spectator.query('.form-errors')).not.toBeNull();
    expect(spectator.query('.form-errors').textContent.trim()).toEqual('This is the error!');
  });

});
