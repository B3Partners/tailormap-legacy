import { DatepickerFieldComponent } from './datepicker-field.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FeatureAttribute, FormFieldType } from '../../../feature-form/form/form-models';
import { FormControl, FormGroup } from '@angular/forms';

const attribute: FeatureAttribute = {
  dateFormat: 'YYYY-MM-DD',
  value: '2021-06-16',
  key: 'test',
  label: 'test',
  column: 1,
  tab: 1,
  type: FormFieldType.DATE,
};

const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

describe('DatepickerFieldComponent', () => {
  let spectator: Spectator<DatepickerFieldComponent>;

  const createComponent = createComponentFactory({
    component: DatepickerFieldComponent,
    imports: [ SharedModule ],
    providers: [{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS } ],
  });

  beforeEach(() => {
    spectator = createComponent({props: {
        attribute,
        groep: new FormGroup({ test: new FormControl('the value') })}});
    spectator.detectChanges();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
